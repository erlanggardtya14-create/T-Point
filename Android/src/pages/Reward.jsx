import { useEffect, useState } from "react";
import { History, Star, Check } from "lucide-react";
import { ref, onValue, push, set, runTransaction } from "firebase/database";
import BottomNavbar from "../components/BottomNavbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

export default function Reward() {
    const { user, authUser, loading } = useAuth();

    const [rewards, setRewards] = useState([]);
    const [rewardsLoading, setRewardsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [selectedItem, setSelectedItem] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const rewardsRef = ref(db, "rewards");
        const unsubscribe = onValue(rewardsRef, (snapshot) => {
            if (snapshot.exists()) {
                const list = Object.entries(snapshot.val()).map(([id, value]) => ({ id, ...value }));
                setRewards(list);
            } else {
                setRewards([]);
            }
            setRewardsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading || !user || rewardsLoading) return <LoadingSpinner />;

    const categories = ["Semua", ...new Set(rewards.map((item) => item.category))];
    const filteredRewards =
        activeCategory === "Semua" ? rewards : rewards.filter((item) => item.category === activeCategory);

    const openConfirm = (item) => {
        setErrorMessage("");
        setSelectedItem(item);
        requestAnimationFrame(() => setSheetOpen(true));
    };

    const closeConfirm = () => {
        setSheetOpen(false);
        setTimeout(() => setSelectedItem(null), 300);
    };

    const confirmTukar = async () => {
        if (!selectedItem) return;
        setRedeeming(true);
        setErrorMessage("");

        const userPointsRef = ref(db, `users/${authUser.uid}/ecoPoint`);
        const result = await runTransaction(userPointsRef, (currentPoints) => {
            const points = currentPoints || 0;
            if (points < selectedItem.points) return points;
            return points - selectedItem.points;
        });

        if (!result.committed || result.snapshot.val() === (user.ecoPoint - selectedItem.points) + selectedItem.points) {
            if (!result.committed) {
                setErrorMessage("Gagal menukar hadiah, coba lagi");
                setRedeeming(false);
                return;
            }
        }

        const newPoints = result.snapshot.val();
        if (newPoints === undefined || newPoints === null) {
            setErrorMessage("Gagal menukar hadiah, coba lagi");
            setRedeeming(false);
            return;
        }

        const redemptionRef = push(ref(db, `redemptions/${authUser.uid}`));
        await set(redemptionRef, {
            rewardId: selectedItem.id,
            rewardName: selectedItem.name,
            category: selectedItem.category,
            points: selectedItem.points,
            imageUrl: selectedItem.img || selectedItem.imageUrl || "",
            status: "pending",
            timestamp: Date.now(),
        });

        setRedeeming(false);
        setSheetOpen(false);
        setTimeout(() => {
            setSelectedItem(null);
            setSuccessOpen(true);
        }, 300);
    };

    const closeSuccess = () => setSuccessOpen(false);

    return (
        <div className="relative w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <p className="font-poppins-bold text-[16px] text-primary">Tukar Hadiah</p>
                        <p className="font-poppins-medium text-gray-400 text-[10px]">Pilih hadiah favoritmu</p>
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
                        <History className="w-4.5 h-4.5 text-primary" />
                    </button>
                </div>

                <div className="bg-linear-to-br from-primary to-[#009923] rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-primary/20">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 text-secondary fill-secondary" />
                            <span className="font-poppins-semibold text-white text-[10px]">{user.ecoPoint.toLocaleString("id-ID")} Point</span>
                        </span>
                        <p className="font-poppins-bold text-white text-2xl">{user.ecoPoint.toLocaleString("id-ID")}</p>
                        <p className="font-poppins-medium text-white/80 text-[11px]">Poin tersedia</p>
                    </div>
                    <Star className="w-14 h-14 text-secondary fill-secondary drop-shadow" />
                </div>

                <p className="font-poppins-medium text-gray-400 text-[11px] mt-4 mb-2">
                    Tukarkan Eco Point dengan berbagai hadiah menarik!
                </p>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full font-poppins-semibold text-[12px] border transition-colors cursor-pointer ${activeCategory === cat
                                ? "bg-primary border-primary text-white"
                                : "bg-white border-primary/30 text-primary"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {filteredRewards.length === 0 ? (
                    <p className="font-poppins-medium text-gray-400 text-[12px] text-center mt-8">Belum ada hadiah di kategori ini</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        {filteredRewards.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md"
                            >
                                <img src={item.imageUrl} alt={item.name} className="w-full h-24 object-cover" />
                                <div className="p-2.5 flex flex-col gap-1.5">
                                    <p className="font-poppins-semibold text-[12px] text-gray-800 leading-tight">{item.name}</p>
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-secondary fill-secondary" />
                                        <span className="font-poppins-medium text-gray-500 text-[10px]">{item.points} Point</span>
                                    </span>
                                    <button
                                        onClick={() => openConfirm(item)}
                                        disabled={user.ecoPoint < item.points || item.stock === 0}
                                        className="w-full bg-primary text-white font-poppins-bold text-[11px] py-2 rounded-xl cursor-pointer active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {item.stock === 0 ? "Habis" : "Tukar"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNavbar />

            {selectedItem && (
                <div
                    className={`absolute inset-0 bg-black/40 flex items-end transition-opacity duration-300 ${sheetOpen ? "opacity-100" : "opacity-0"}`}
                    onClick={closeConfirm}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full bg-white rounded-t-3xl p-5 flex flex-col items-center gap-4 transition-transform duration-300 ease-out ${sheetOpen ? "translate-y-0" : "translate-y-full"}`}
                    >
                        <div className="w-10 h-1 rounded-full bg-gray-200" />
                        <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-40 h-28 object-cover rounded-xl" />
                        <div className="flex flex-col items-center gap-1">
                            <p className="font-poppins-bold text-primary text-[16px]">Tukar {selectedItem.name}?</p>
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                                <span className="font-poppins-medium text-gray-500 text-[12px]">
                                    {selectedItem.points} Poin akan dikurangi dari akunmu
                                </span>
                            </span>
                        </div>
                        {errorMessage && <p className="font-poppins-medium text-red-500 text-[12px]">{errorMessage}</p>}
                        <button
                            onClick={confirmTukar}
                            disabled={redeeming}
                            className="w-full bg-linear-to-r from-primary to-[#009923] text-white font-poppins-bold text-[14px] py-3.5 rounded-xl cursor-pointer active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {redeeming ? "Memproses..." : "Ya, Tukar Sekarang"}
                        </button>
                        <button onClick={closeConfirm} className="font-poppins-semibold text-primary text-[13px] cursor-pointer">
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {successOpen && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 animate-fade-in-up">
                    <div className="w-full bg-white rounded-3xl p-6 flex flex-col items-center gap-3 animate-bounce-in">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-primary/15" />
                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <p className="font-poppins-bold text-gray-800 text-[16px] text-center">Hadiah Berhasil ditukarkan</p>
                        <p className="font-poppins-medium text-gray-400 text-[11px] text-center px-2">
                            Hadiah berhasil ditukarkan, datang ke koperasi untuk mengambilnya
                        </p>
                        <button
                            onClick={closeSuccess}
                            className="w-full bg-linear-to-r from-primary to-[#009923] text-white font-poppins-bold text-[14px] py-3.5 rounded-xl cursor-pointer active:scale-95 transition-transform mt-1"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}