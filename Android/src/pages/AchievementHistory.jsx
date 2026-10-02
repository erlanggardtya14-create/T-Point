import { useEffect, useState } from "react";
import { ArrowLeft, Sprout, PackageCheck, FileText, Wrench, GlassWater, Leaf, Flame, Trophy, Crown, Star, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../lib/firebase";

const styleMap = {
    total_setoran: { bg: "bg-green-50", iconColor: "text-primary", pillBg: "bg-green-100", pillText: "text-green-700" },
    category_count_Plastik: { bg: "bg-blue-50", iconColor: "text-blue-500", pillBg: "bg-blue-100", pillText: "text-blue-700" },
    category_count_Kertas: { bg: "bg-amber-50", iconColor: "text-amber-500", pillBg: "bg-amber-100", pillText: "text-amber-700" },
    category_count_Logam: { bg: "bg-slate-50", iconColor: "text-slate-500", pillBg: "bg-slate-100", pillText: "text-slate-700" },
    category_count_Kaca: { bg: "bg-cyan-50", iconColor: "text-cyan-500", pillBg: "bg-cyan-100", pillText: "text-cyan-700" },
    category_count_Organik: { bg: "bg-emerald-50", iconColor: "text-emerald-500", pillBg: "bg-emerald-100", pillText: "text-emerald-700" },
    login_streak: { bg: "bg-red-50", iconColor: "text-red-400", pillBg: "bg-red-100", pillText: "text-red-700" },
    leaderboard_rank: { bg: "bg-amber-50", iconColor: "text-secondary", pillBg: "bg-amber-100", pillText: "text-amber-700" },
    default: { bg: "bg-gray-50", iconColor: "text-gray-500", pillBg: "bg-gray-100", pillText: "text-gray-500" },
};

function getBadgeIcon(requirement) {
    if (requirement.type === "total_setoran") return Sprout;
    if (requirement.type === "category_count") {
        if (requirement.category === "Plastik") return PackageCheck;
        if (requirement.category === "Kertas") return FileText;
        if (requirement.category === "Logam") return Wrench;
        if (requirement.category === "Kaca") return GlassWater;
        if (requirement.category === "Organik") return Leaf;
        return PackageCheck;
    }
    if (requirement.type === "login_streak") return Flame;
    if (requirement.type === "leaderboard_rank") return requirement.target <= 3 ? Crown : Trophy;
    return Star;
}

function getBadgeStyle(requirement) {
    if (requirement.type === "category_count") {
        return styleMap[`category_count_${requirement.category}`] || styleMap.default;
    }
    return styleMap[requirement.type] || styleMap.default;
}

function getProgress(requirement, stats) {
    if (requirement.type === "total_setoran") {
        return { current: stats.totalSetoran, target: requirement.target };
    }
    if (requirement.type === "category_count") {
        return { current: stats.categoryCounts[requirement.category] || 0, target: requirement.target };
    }
    if (requirement.type === "leaderboard_rank") {
        if (stats.rank == null) return null;
        return { current: stats.rank, target: requirement.target, inverted: true };
    }
    return null;
}

export default function AchievementHistory() {
    const navigate = useNavigate();
    const [uid, setUid] = useState(null);
    const [achievements, setAchievements] = useState({});
    const [unlockedBadges, setUnlockedBadges] = useState({});
    const [stats, setStats] = useState({ totalSetoran: 0, categoryCounts: {}, rank: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUid(user ? user.uid : null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const achievementsRef = ref(db, "achievements");
        const unsubscribe = onValue(achievementsRef, (snapshot) => {
            setAchievements(snapshot.val() || {});
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }

        const userRef = ref(db, `users/${uid}`);
        const depositsRef = ref(db, `deposits/${uid}`);

        const unsubscribeUser = onValue(userRef, (snapshot) => {
            const userData = snapshot.val() || {};
            setUnlockedBadges(userData.badges || {});
            setStats((prev) => ({ ...prev, totalSetoran: userData.totalSetoran || 0 }));
        });

        const unsubscribeDeposits = onValue(depositsRef, (snapshot) => {
            const depositsData = snapshot.val() || {};
            const counts = {};
            Object.values(depositsData).forEach((deposit) => {
                counts[deposit.category] = (counts[deposit.category] || 0) + 1;
            });
            setStats((prev) => ({ ...prev, categoryCounts: counts }));
        });

        get(ref(db, "users")).then((snapshot) => {
            const usersData = snapshot.val() || {};
            const ranked = Object.entries(usersData).sort((a, b) => (b[1].ecoPoint || 0) - (a[1].ecoPoint || 0));
            const rankIndex = ranked.findIndex(([id]) => id === uid);
            setStats((prev) => ({ ...prev, rank: rankIndex === -1 ? null : rankIndex + 1 }));
            setLoading(false);
        });

        return () => {
            unsubscribeUser();
            unsubscribeDeposits();
        };
    }, [uid]);

    const badgeList = Object.entries(achievements).map(([id, data]) => ({ id, ...data }));
    const totalBadge = badgeList.filter((badge) => unlockedBadges[badge.id]).length;
    const targetBadge = badgeList.length;
    const progressPercent = targetBadge ? Math.round((totalBadge / targetBadge) * 100) : 0;

    return (
        <div className="relative w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-gray-50 flex flex-col">
            <div className="bg-linear-to-br from-primary to-[#009923] pt-5 pb-6 px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
                        <ArrowLeft className="w-4.5 h-4.5 text-white" />
                    </button>
                    <div className="flex flex-col">
                        <p className="font-poppins-bold text-white text-[16px]">Pencapaian</p>
                        <p className="font-poppins-medium text-white/80 text-[11px]">Lihat badge yang anda kumpulkan</p>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-3">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <p className="font-poppins-semibold text-gray-500 text-[11px]">Total Badge</p>
                            <p className="font-poppins-bold text-gray-800 text-[15px]">{totalBadge} / {targetBadge}</p>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 mt-2 pb-6">

                {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-gray-100 shadow-sm p-3.5 h-32.5 bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : !uid ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                        <p className="font-poppins-medium text-gray-500 text-[12px]">Silakan masuk untuk melihat pencapaian anda</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {badgeList.map((badge) => {
                            const unlocked = Boolean(unlockedBadges[badge.id]);
                            const Icon = getBadgeIcon(badge.requirement);
                            const style = unlocked ? getBadgeStyle(badge.requirement) : styleMap.default;
                            const progress = !unlocked ? getProgress(badge.requirement, stats) : null;

                            return (
                                <div key={badge.id} className={`relative rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-col gap-2 ${style.bg}`}>
                                    {!unlocked && (
                                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
                                            <Lock className="w-3 h-3 text-gray-400" />
                                        </div>
                                    )}
                                    <Icon className={`w-7 h-7 ${style.iconColor}`} />
                                    <p className="font-poppins-bold text-gray-800 text-[12.5px] leading-tight">{badge.title}</p>
                                    <p className="font-poppins-medium text-gray-500 text-[10px] leading-tight">{badge.desc}</p>
                                    {progress && (
                                        <p className="font-poppins-medium text-gray-400 text-[9.5px] leading-tight">
                                            {progress.inverted ? `Peringkat ${progress.current}` : `${progress.current} / ${progress.target}`}
                                        </p>
                                    )}
                                    <span className={`w-fit px-2.5 py-1 rounded-full font-poppins-semibold text-[10px] ${unlocked ? style.pillBg : styleMap.default.pillBg} ${unlocked ? style.pillText : styleMap.default.pillText}`}>
                                        {unlocked ? "Unlocked" : "Locked"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}