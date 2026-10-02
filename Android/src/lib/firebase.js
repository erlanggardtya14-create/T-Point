import { initializeApp } from "firebase/app";
import {
    getDatabase,
    ref,
    get,
    set,
    push,
    runTransaction,
    onValue,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBK916Rv8lszq-bdNHRME8XUl_P158xJiI",
    authDomain: "trash-point-d00f2.firebaseapp.com",
    databaseURL: "https://trash-point-d00f2-default-rtdb.firebaseio.com",
    projectId: "trash-point-d00f2",
    storageBucket: "trash-point-d00f2.firebasestorage.app",
    messagingSenderId: "999885319126",
    appId: "1:999885319126:web:da199dbfd98fb7e57d9277",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export async function checkBinFull() {
    const snap = await get(ref(db, "bin/status/isFull"));
    return snap.exists() ? snap.val() === true : false;
}

export async function openSmartBin() {
    await set(ref(db, "bin/status/trashDetected"), false);
    await set(ref(db, "bin/status/isOpen"), true);
    await set(ref(db, "bin/status/timestamp"), Date.now());
}

export async function closeSmartBin() {
    await set(ref(db, "bin/status/isOpen"), false);
    await set(ref(db, "bin/status/trashDetected"), false);
    await set(ref(db, "bin/status/timestamp"), Date.now());
}

export function requestOpenBin(timeoutMs = 5000) {
    return new Promise((resolve) => {
        const fullRef = ref(db, "bin/status/isFull");

        let settled = false;
        let timer = null;
        let unsubscribe = null;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
            if (unsubscribe) unsubscribe();
        };

        const finish = (result) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(result);
        };

        unsubscribe = onValue(fullRef, (snapshot) => {
            const isFull = snapshot.val() === true;

            console.log("[OPEN BIN] isFull:", isFull);

            if (isFull) {
                set(ref(db, "bin/status/isOpen"), false).catch((error) => {
                    console.error("Gagal menutup bin:", error);
                });

                finish(false);
            }
        });

        if (settled && unsubscribe) {
            unsubscribe();
        }

        timer = setTimeout(() => {
            console.log("[OPEN BIN] Timeout cek full");
            finish(true);
        }, timeoutMs);

        openSmartBin()
            .then(() => {
                console.log("[OPEN BIN] Request buka terkirim");
            })
            .catch((error) => {
                console.error("[OPEN BIN] Gagal:", error);
                finish(false);
            });
    });
}

export function waitForDeposit(timeoutMs = 30000) {
    return new Promise((resolve) => {
        const depositRef = ref(db, "bin/status/trashDetected");

        let settled = false;
        let timer = null;
        let unsubscribe = null;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
            if (unsubscribe) unsubscribe();
        };

        const finish = (result) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(result);
        };

        unsubscribe = onValue(depositRef, (snapshot) => {
            const value = snapshot.val() === true;

            console.log("[WAIT DEPOSIT] trashDetected:", value);

            if (value) {
                console.log("[WAIT DEPOSIT] Sampah berhasil terdeteksi!");

                finish(true);

                set(ref(db, "bin/status/trashDetected"), false).catch((error) => {
                    console.error("[WAIT DEPOSIT] Gagal reset:", error);
                });
            }
        });

        if (settled && unsubscribe) {
            unsubscribe();
        }

        console.log("[WAIT DEPOSIT] Listener aktif");

        timer = setTimeout(() => {
            console.log("[WAIT DEPOSIT] Timeout");
            finish(false);
        }, timeoutMs);
    });
}

export async function logDeposit(
    uid,
    { category, skor, kualitas, jumlah, points }
) {
    const safeCategory = category || "Lainnya";
    const safeSkor = Number.isFinite(skor) ? skor : 0;
    const safeKualitas = Number.isFinite(kualitas) ? kualitas : 0;

    const finalJumlah = Math.max(
        1,
        Math.round(Number.isFinite(jumlah) ? jumlah : 1)
    );

    const finalPoints = Math.max(
        1,
        Math.min(100, Math.round(Number.isFinite(points) ? points : 1))
    );

    const record = {
        category: safeCategory,
        skor: safeSkor,
        kualitas: safeKualitas,
        jumlah: finalJumlah,
        points: finalPoints,
        timestamp: Date.now(),
    };

    await set(ref(db, "bin/lastDeposit"), record);

    const depositRef = push(ref(db, `deposits/${uid}`));
    await set(depositRef, record);

    await runTransaction(ref(db, `users/${uid}`), (currentUser) => {
        const base = currentUser || {
            ecoPoint: 0,
            totalSetoran: 0,
            totalSampah: 0,
        };

        return {
            ...base,
            ecoPoint: (base.ecoPoint || 0) + finalPoints,
            totalSetoran: (base.totalSetoran || 0) + 1,
            totalSampah: (base.totalSampah || 0) + finalJumlah,
        };
    });

    return finalPoints;
}