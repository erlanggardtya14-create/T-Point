import { useEffect, useState } from "react";
import trash from "/logo/logo.png";
import { Bell, Star, Trophy, Recycle, Award, Camera, Gift, BarChart2, History, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";
import BottomNavbar from "../components/BottomNavbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

const quickActions = [
    { label: "Hadiah", icon: Gift, bg: "bg-orange-50", color: "text-orange-500", path: "/reward" },
    { label: "Peringkat", icon: BarChart2, bg: "bg-blue-50", color: "text-blue-500", path: "/leaderboard" },
    { label: "Riwayat", icon: History, bg: "bg-red-50", color: "text-red-400", path: "/scan-history" },
    { label: "Pencapaian", icon: Award, bg: "bg-purple-50", color: "text-purple-500", path: "/achievement-history" },
];

export default function Home() {
    const navigate = useNavigate();
    const { user, authUser, loading } = useAuth();

    const [rank, setRank] = useState(null);
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [recentRewards, setRecentRewards] = useState([]);
    const [secondaryLoading, setSecondaryLoading] = useState(true);

    useEffect(() => {
        if (!authUser) return;

        async function loadSecondaryData() {
            try {
                const usersSnap = await get(ref(db, "users"));
                if (usersSnap.exists()) {
                    const entries = Object.entries(usersSnap.val());

                    entries.sort((a, b) => (b[1].ecoPoint || 0) - (a[1].ecoPoint || 0));

                    const position = entries.findIndex(([uid]) => uid === authUser.uid);

                    if (position !== -1) {
                        setRank(position + 1);
                    }
                }

                const badgesSnap = await get(ref(db, `users/${authUser.uid}/badges`));
                if (badgesSnap.exists()) {
                    const achievementsSnap = await get(ref(db, "achievements"));
                    const catalog = achievementsSnap.exists() ? achievementsSnap.val() : {};

                    const unlocked = Object.entries(badgesSnap.val())
                        .map(([badgeId, value]) => ({
                            badgeId,
                            unlockedAt: typeof value === "number" ? value : 0,
                            ...catalog[badgeId],
                        }))
                        .filter((item) => item.title)
                        .sort((a, b) => b.unlockedAt - a.unlockedAt)
                        .slice(0, 3);

                    setRecentAchievements(unlocked);
                }

                const redemptionsSnap = await get(ref(db, `redemptions/${authUser.uid}`));
                if (redemptionsSnap.exists()) {
                    const list = Object.values(redemptionsSnap.val())
                        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                        .slice(0, 3);

                    setRecentRewards(list);
                }
            } finally {
                setSecondaryLoading(false);
            }
        }

        loadSecondaryData();
    }, [authUser]);

    if (loading || !user) return <LoadingSpinner />;

    const target = Math.max(500, Math.ceil((user.ecoPoint + 1) / 500) * 500);
    const progressPercent = Math.min(100, Math.round((user.ecoPoint / target) * 100));
    const badgeCount = user.badges ? Object.keys(user.badges).length : 0;
    const initials = (user.name || "U")
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=00BF2A&color=fff&bold=true&size=128`;

    return (
        <div className="w-full min-h-screen max-w-107.5 mx-auto bg-white pb-28">
            <div className="flex flex-col gap-5 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={avatarUrl} alt={initials} className="w-9 h-9 rounded-full object-cover" />
                        <div className="flex flex-col">
                            <p className="font-poppins-semibold text-[14px]">Hi, {user.name} 👋</p>
                            <p className="font-poppins-medium text-gray-400 text-[11px]">{user.className || "Kelas belum diatur"}</p>
                        </div>
                    </div>
                    <button className="border border-gray-200 rounded-full p-2 cursor-pointer">
                        <Bell className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <div className="bg-linear-to-br from-primary to-green-700 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
                    <div className="flex flex-col gap-2 z-10">
                        <span className="bg-white/20 text-white font-poppins-semibold text-[10px] px-3 py-1 rounded-full w-fit">
                            {user.level || "Eco Rookie"}
                        </span>
                        <p className="text-white font-poppins-bold text-[18px]">{user.ecoPoint} / {target} XP</p>
                        <div className="w-32 h-1.5 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <p className="text-white/80 font-poppins-medium text-[10px]">{target - user.ecoPoint} XP menuju level berikutnya</p>
                    </div>
                    <img src={trash} alt="trash mascot" className="w-20 h-auto z-10" />
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="font-poppins-bold text-[15px]">Progress Kamu</h1>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-amber-50 rounded-xl p-3 flex flex-col gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            <p className="font-poppins-bold text-[18px]">{user.ecoPoint.toLocaleString("id-ID")}</p>
                            <p className="font-poppins-medium text-amber-600 text-[11px]">Eco Poin</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 flex flex-col gap-2">
                            <Trophy className="w-5 h-5 text-blue-500 fill-blue-500" />
                            <p className="font-poppins-bold text-[18px]">{rank ? `#${rank}` : "-"}</p>
                            <p className="font-poppins-medium text-blue-600 text-[11px]">Peringkat</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 flex flex-col gap-2">
                            <Recycle className="w-5 h-5 text-green-500" />
                            <p className="font-poppins-bold text-[18px]">{user.totalSampah || 0}</p>
                            <p className="font-poppins-medium text-green-600 text-[11px]">Jumlah Sampah</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 flex flex-col gap-2">
                            <Award className="w-5 h-5 text-purple-500 fill-purple-500" />
                            <p className="font-poppins-bold text-[18px]">{badgeCount}</p>
                            <p className="font-poppins-medium text-purple-600 text-[11px]">Lencana</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="font-poppins-bold text-[15px]">Aksi Cepat</h1>

                    <button
                        onClick={() => navigate("/scan")}
                        className="bg-linear-to-r from-primary to-green-700 rounded-xl p-3 flex items-center justify-between text-left cursor-pointer active:scale-[0.98] transition-transform shadow-sm shadow-primary/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-lg p-2">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <p className="font-poppins-bold text-white text-[13px]">Scan Smart Bin</p>
                                <p className="font-poppins-medium text-white/80 text-[11px]">Ayo tukar sampahmu menjadi poin</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>

                    <div className="grid grid-cols-4 gap-4 mt-1">
                        {quickActions.map(({ label, icon: Icon, bg, color, path }) => (
                            <button
                                key={label}
                                onClick={() => navigate(path)}
                                className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                            >
                                <div className={`${bg} border border-gray-100 rounded-2xl w-full aspect-square flex items-center justify-center shadow-sm`}>
                                    <Icon strokeWidth={2} className={`w-8 h-8 ${color}`} />
                                </div>
                                <p className="font-poppins-semibold text-gray-600 text-[10px] text-center leading-tight">{label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h1 className="font-poppins-bold text-[15px]">Riwayat Pencapaian</h1>
                        <p onClick={() => navigate("/achievement-history")} className="font-poppins-semibold text-primary text-[12px] cursor-pointer">Lihat Semua</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        {secondaryLoading && (
                            <p className="font-poppins-medium text-gray-400 text-[12px] py-2">Memuat pencapaian...</p>
                        )}
                        {!secondaryLoading && recentAchievements.length === 0 && (
                            <p className="font-poppins-medium text-gray-400 text-[12px] py-2">Belum ada pencapaian, ayo mulai menyetor sampah!</p>
                        )}
                        {recentAchievements.map((item) => (
                            <div
                                key={item.badgeId}
                                onClick={() => navigate("/achievement-history")}
                                className="bg-amber-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 rounded-full p-2">
                                        <Award className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-poppins-bold text-[13px]">{item.title}</p>
                                        <p className="font-poppins-medium text-gray-400 text-[11px]">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h1 className="font-poppins-bold text-[15px]">Riwayat Penukaran</h1>
                        <p onClick={() => navigate("/reward-history")} className="font-poppins-semibold text-primary text-[12px] cursor-pointer">Lihat Semua</p>
                    </div>

                    {secondaryLoading && (
                        <p className="font-poppins-medium text-gray-400 text-[12px] py-2">Memuat riwayat...</p>
                    )}
                    {!secondaryLoading && recentRewards.length === 0 && (
                        <p className="font-poppins-medium text-gray-400 text-[12px] py-2">Belum ada hadiah yang ditukar</p>
                    )}
                    {recentRewards.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar">
                            {recentRewards.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate("/reward-history")}
                                    className="flex flex-col gap-1 shrink-0 w-40 cursor-pointer"
                                >
                                    <img src={item.imageUrl || `https://placehold.co/300x200/dcfce7/16a34a?text=${encodeURIComponent(item.rewardName)}`} alt={item.rewardName} className="w-full h-24 rounded-xl object-cover" />
                                    <p className="font-poppins-semibold text-[12px] truncate">{item.rewardName}</p>
                                    <span className="bg-green-100 text-green-600 font-poppins-semibold text-[10px] px-2 py-0.5 rounded-full w-fit">
                                        {item.points} Poin
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNavbar />
        </div>
    );
}