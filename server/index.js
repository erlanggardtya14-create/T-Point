const BASE_URL =
    "https://trash-point-d00f2-default-rtdb.firebaseio.com";

const rewards = {
    reward_001: { name: "Buku Tulis", points: 100, category: "Alat Tulis", imageUrl: "https://officemart.id/wp-content/uploads/2025/09/ibook-campus-38-lembar.jpeg", stock: 50 },
    reward_002: { name: "Pensil", points: 50, category: "Alat Tulis", imageUrl: "https://faber-castell.co.id/cfind/source/thumb/images/product/gwm/contain_w700_h700_117102-a.jpg.png", stock: 100 },
    reward_003: { name: "Pulpen", points: 60, category: "Alat Tulis", imageUrl: "https://img.brdu.pw/img/500/bq15x7szbq42fpbqc2_1/fGpI7UWEdsCDH4ZfGN96PUbgOloV07RSKRRlw5ARWAPw.jpg", stock: 80 },
    reward_004: { name: "Penghapus", points: 40, category: "Alat Tulis", imageUrl: "https://parto.id/asset/foto_produk/Penghapus_joyko.png", stock: 70 },
    reward_005: { name: "Rautan", points: 45, category: "Alat Tulis", imageUrl: "https://siplah.blibli.com/data/images/STTM-0003-00362/e4d27cc0-3ab9-4165-9096-f67498ebc3d2.jpg", stock: 60 },
    reward_006: { name: "Penggaris", points: 50, category: "Alat Tulis", imageUrl: "https://officemart.id/wp-content/uploads/2025/08/penggaris-30-cm.jpeg", stock: 40 },
    reward_007: { name: "Spidol", points: 80, category: "Alat Tulis", imageUrl: "https://www.toyibs.com/wp-content/uploads/2022/03/WhatsApp-Image-2022-03-29-at-13.30.03.jpeg", stock: 35 },
    reward_008: { name: "Pensil Warna", points: 150, category: "Alat Tulis", imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBzGZSpCJHHMWCF1zR17Uvbp2LynP4AuJlET8RkJbPC6-DlWrMMRKcDcs&s=10", stock: 30 },
    reward_009: { name: "Buku Gambar", points: 90, category: "Alat Tulis", imageUrl: "https://down-id.img.susercontent.com/file/id-11134207-7rasi-m21whuz8viai6f", stock: 40 },
    reward_010: { name: "Map Plastik", points: 70, category: "Alat Tulis", imageUrl: "https://down-id.img.susercontent.com/file/bbda7eaeb6509836182175dc4c49a5e4", stock: 45 },

    reward_011: { name: "Dasi Sekolah", points: 300, category: "Seragam & Aksesoris", imageUrl: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//98/MTA-6774416/mulyocreative_dasi_abu-abu_polos_seragam_sekolah_sma-smk_-2pcs-_full02_oe057pl0.jpg", stock: 20 },
    reward_012: { name: "Topi Sekolah", points: 250, category: "Seragam & Aksesoris", imageUrl: "https://down-id.img.susercontent.com/file/f4f3c3616f74d887dfd206c377cdb469", stock: 20 },
    reward_013: { name: "Ikat Pinggang Sekolah", points: 280, category: "Seragam & Aksesoris", imageUrl: "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/110/MTA-157438838/no-brand_sabuk-gesper-ikat-pinggang-seragam-sekolah-sma_full01.jpg", stock: 15 },
    reward_014: { name: "Kaos Kaki Sekolah", points: 150, category: "Seragam & Aksesoris", imageUrl: "https://img.lazcdn.com/g/p/1c8e23f36efdc10b7c8bce5dd59f4018.jpg_720x720q80.jpg", stock: 30 },
};

const achievements = {
    badge_001: { title: "Eco Rookie", desc: "Setor sampah pertama", requirement: { type: "total_setoran", target: 1 } },
    badge_002: { title: "Eco Beginner", desc: "5 kali setor sampah", requirement: { type: "total_setoran", target: 5 } },
    badge_003: { title: "Eco Active", desc: "10 ka  li setor sampah", requirement: { type: "total_setoran", target: 10 } },
    badge_004: { title: "Eco Expert", desc: "25 kali setor sampah", requirement: { type: "total_setoran", target: 25 } },
    badge_005: { title: "Eco Master", desc: "50 kali setor sampah", requirement: { type: "total_setoran", target: 50 } },

    badge_006: { title: "Plastic Hero I", desc: "10 sampah plastik", requirement: { type: "category_count", category: "Plastik", target: 10 } },
    badge_007: { title: "Plastic Hero II", desc: "50 sampah plastik", requirement: { type: "category_count", category: "Plastik", target: 50 } },
    badge_008: { title: "Plastic Hero III", desc: "100 sampah plastik", requirement: { type: "category_count", category: "Plastik", target: 100 } },

    badge_009: { title: "Paper Saver I", desc: "20 sampah kertas", requirement: { type: "category_count", category: "Kertas", target: 20 } },
    badge_010: { title: "Paper Saver II", desc: "100 sampah kertas", requirement: { type: "category_count", category: "Kertas", target: 100 } },

    badge_011: { title: "Metal Hunter", desc: "50 sampah logam", requirement: { type: "category_count", category: "Logam", target: 50 } },
    badge_012: { title: "Glass Collector", desc: "50 sampah kaca", requirement: { type: "category_count", category: "Kaca", target: 50 } },
    badge_013: { title: "Organic Lover", desc: "100 sampah organik", requirement: { type: "category_count", category: "Organik", target: 100 } },

    badge_014: { title: "Login 3 Hari", desc: "Login 3 hari berturut-turut", requirement: { type: "login_streak", target: 3 } },
    badge_015: { title: "Login 7 Hari", desc: "Login 7 hari berturut-turut", requirement: { type: "login_streak", target: 7 } },
    badge_016: { title: "Login 14 Hari", desc: "Login 14 hari berturut-turut", requirement: { type: "login_streak", target: 14 } },
    badge_017: { title: "Login 30 Hari", desc: "Login 30 hari berturut-turut", requirement: { type: "login_streak", target: 30 } },

    badge_018: { title: "Top 100", desc: "Masuk Top 100 leaderboard", requirement: { type: "leaderboard_rank", target: 100 } },
    badge_019: { title: "Top 50", desc: "Masuk Top 50 leaderboard", requirement: { type: "leaderboard_rank", target: 50 } },
    badge_020: { title: "Top 25", desc: "Masuk Top 25 leaderboard", requirement: { type: "leaderboard_rank", target: 25 } },
    badge_021: { title: "Top 10", desc: "Masuk Top 10 leaderboard", requirement: { type: "leaderboard_rank", target: 10 } },
    badge_022: { title: "Top 5", desc: "Masuk Top 5 leaderboard", requirement: { type: "leaderboard_rank", target: 5 } },
    badge_023: { title: "Juara 3", desc: "Peringkat 3 leaderboard", requirement: { type: "leaderboard_rank", target: 3 } },
    badge_024: { title: "Juara 2", desc: "Peringkat 2 leaderboard", requirement: { type: "leaderboard_rank", target: 2 } },
    badge_025: { title: "Champion", desc: "Peringkat 1 leaderboard", requirement: { type: "leaderboard_rank", target: 1 } },
};

async function put(path, data) {
    const res = await fetch(`${BASE_URL}/${path}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}

async function post(path, data) {
    const res = await fetch(`${BASE_URL}/${path}.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}

async function seed() {
    await put("rewards", rewards);
    await put("achievements", achievements);

    const sampleUid = process.argv[2];

    if (sampleUid) {
        await post(`redemptions/${sampleUid}`, {
            rewardId: "reward_buku_tulis",
            rewardName: "Buku Tulis",
            category: "Alat Tulis",
            points: 100,
            imageUrl: rewards.reward_buku_tulis.imageUrl,
            status: "pending",
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
        });

        console.log(`Contoh redemption ditambahkan ke uid ${sampleUid}`);
    }

    console.log("Seed selesai");
}

seed().catch((err) => {
    console.error(err);
});