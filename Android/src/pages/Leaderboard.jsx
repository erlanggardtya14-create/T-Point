import { useEffect, useMemo, useState } from "react";
import { Star, Medal, Crown } from "lucide-react";
import { ref, onValue } from "firebase/database";
import BottomNavbar from "../components/BottomNavbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

const podiumStyle = [
    { badgeColor: "bg-secondary", barColor: "bg-secondary", glowRgb: "239,191,0", height: "8rem" },
    { badgeColor: "bg-purple-400", barColor: "bg-purple-400", glowRgb: "192,132,252", height: "6rem" },
    { badgeColor: "bg-blue-400", barColor: "bg-blue-400", glowRgb: "96,165,250", height: "5rem" },
];

function avatarFor(name, avatarUrl, bgColor) {
    if (avatarUrl) return avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=${bgColor}&color=fff&bold=true`;
}

export default function Leaderboard() {
    const { authUser, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        const usersRef = ref(db, "users");
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const list = Object.entries(snapshot.val())
                    .map(([uid, value]) => ({ uid, ...value, ecoPoint: value.ecoPoint || 0 }))
                    .sort((a, b) => b.ecoPoint - a.ecoPoint)
                    .map((item, index) => ({ ...item, rank: index + 1 }));
                setUsers(list);
            } else {
                setUsers([]);
            }
            setUsersLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const { topThree, others, currentUser } = useMemo(() => {
        const top = users.slice(0, 3).map((item, index) => ({
            ...item,
            avatar: avatarFor(item.name, item.avatarUrl, index === 0 ? "fbbf24" : index === 1 ? "c084fc" : "60a5fa"),
            ...podiumStyle[index],
        }));
        const rest = users.slice(3).map((item) => ({
            ...item,
            avatar: avatarFor(item.name, item.avatarUrl, "e5e7eb"),
        }));
        const me = users.find((item) => item.uid === authUser?.uid);
        return { topThree: top, others: rest, currentUser: me };
    }, [users, authUser]);

    const podiumOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;
    if (loading || usersLoading) return <LoadingSpinner />;

    return (
        <div className="relative w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto pb-28">
                <div className="bg-linear-to-br from-primary to-[#009923] pt-5 px-4 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-xl animate-pulse" />
                    <div className="absolute top-20 -left-8 w-24 h-24 rounded-full bg-white/10 blur-lg animate-pulse" style={{ animationDelay: "0.5s" }} />

                    <div
                        className={`relative flex flex-col mb-4 transition-all duration-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
                    >
                        <p className="font-poppins-bold text-white text-[19px] drop-shadow-sm">Papan Peringkat</p>
                        <p className="font-poppins-medium text-white/80 text-[11px]">Lihat siapa yang paling aktif!</p>
                    </div>

                    {currentUser && (
                        <div
                            className={`relative bg-white/15 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between mb-9 border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={avatarFor(currentUser.name, currentUser.avatarUrl, "ffffff")}
                                    alt={currentUser.name}
                                    className="w-11 h-11 rounded-full object-cover border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                />
                                <div className="flex flex-col">
                                    <p className="font-poppins-bold text-white text-[13px]">{currentUser.name} • {currentUser.className || "-"}</p>
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-secondary fill-secondary" />
                                        <span className="font-poppins-medium text-white/90 text-[11px]">{currentUser.ecoPoint.toLocaleString("id-ID")} Point</span>
                                    </span>
                                </div>
                            </div>
                            <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.25)]">
                                <Medal className="w-3.5 h-3.5 text-white" />
                                <span className="font-poppins-bold text-white text-[12px]">#{currentUser.rank}</span>
                            </span>
                        </div>
                    )}

                    {podiumOrder.length === 3 && (
                        <div className="relative flex items-end justify-center gap-3">
                            {podiumOrder.map((item, index) => (
                                <div key={item.uid} className="relative flex flex-col items-center flex-1">
                                    <div
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-2xl pointer-events-none"
                                        style={{
                                            width: "90%",
                                            height: item.height,
                                            background: `radial-gradient(ellipse at center, rgba(${item.glowRgb},0.55) 0%, rgba(${item.glowRgb},0) 70%)`,
                                            opacity: mounted ? 1 : 0,
                                            transition: "opacity 700ms ease-out",
                                            transitionDelay: `${300 + index * 120}ms`,
                                        }}
                                    />

                                    <div
                                        className={`relative w-11 h-11 rounded-xl ${item.badgeColor} flex items-center justify-center mb-1.5 overflow-hidden ring-2 ring-white/50 transition-all duration-500 ease-out`}
                                        style={{
                                            boxShadow: `0 0 22px rgba(${item.glowRgb},0.8)`,
                                            transitionDelay: `${200 + index * 120}ms`,
                                            opacity: mounted ? 1 : 0,
                                            transform: mounted ? "scale(1)" : "scale(0.4)",
                                        }}
                                    >
                                        {item.rank === 1 && (
                                            <Crown className="absolute -top-3.5 w-4 h-4 text-secondary fill-secondary drop-shadow-[0_0_8px_rgba(239,191,0,0.9)] animate-pulse" />
                                        )}
                                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    <p
                                        className="font-poppins-bold text-white text-[11px] text-center leading-tight"
                                        style={item.rank === 1 ? { textShadow: "0 0 10px rgba(239,191,0,0.8)" } : undefined}
                                    >
                                        {item.name}
                                    </p>
                                    <p className="font-poppins-medium text-white/80 text-[10px] mb-2">{item.ecoPoint.toLocaleString("id-ID")}</p>

                                    <div
                                        className={`relative w-full ${item.barColor} rounded-t-2xl flex items-start justify-center pt-2 overflow-hidden ring-1 ring-white/40 transition-all duration-700 ease-out`}
                                        style={{
                                            height: mounted ? item.height : "0rem",
                                            boxShadow: `0 0 28px rgba(${item.glowRgb},0.7), 0 0 60px rgba(${item.glowRgb},0.35), inset 0 1px 0 rgba(255,255,255,0.5)`,
                                            transitionDelay: `${350 + index * 120}ms`,
                                        }}
                                    >
                                        <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/35 to-transparent pointer-events-none" />
                                        <span
                                            className="relative font-poppins-bold text-white text-2xl"
                                            style={{ textShadow: `0 0 12px rgba(${item.glowRgb},0.9), 0 2px 4px rgba(0,0,0,0.2)` }}
                                        >
                                            {item.rank}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {users.length === 0 && (
                        <p className="relative font-poppins-medium text-white/80 text-[12px] text-center pb-8">Belum ada data peringkat</p>
                    )}
                </div>

                <div className="px-4 pt-5">
                    <p className="font-poppins-bold text-gray-800 text-[14px] mb-3">Peringkat Selengkapnya</p>
                    {others.length === 0 ? (
                        <p className="font-poppins-medium text-gray-400 text-[12px] text-center py-4">Belum ada peserta lain</p>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {others.map((item, index) => (
                                <div
                                    key={item.uid}
                                    className={`flex items-center gap-3 rounded-2xl p-2.5 shadow-sm transition-all duration-500 ease-out hover:shadow-md hover:-translate-y-0.5 ${item.uid === authUser?.uid ? "bg-primary/5 border border-primary/30" : "bg-white border border-gray-100"
                                        }`}
                                    style={{
                                        transitionDelay: mounted ? `${900 + index * 90}ms` : "0ms",
                                        opacity: mounted ? 1 : 0,
                                        transform: mounted ? "translateY(0)" : "translateY(12px)",
                                    }}
                                >
                                    <span className="font-poppins-bold text-gray-400 text-[12px] w-6 text-center">#{item.rank}</span>
                                    <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex flex-col flex-1">
                                        <p className="font-poppins-semibold text-gray-800 text-[12.5px]">{item.name}</p>
                                        <p className="font-poppins-medium text-gray-400 text-[10.5px]">{item.className || "-"}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-secondary fill-secondary" />
                                            <span className="font-poppins-bold text-gray-700 text-[12px]">{item.ecoPoint.toLocaleString("id-ID")}</span>
                                        </span>
                                        <p className="font-poppins-medium text-gray-400 text-[9px]">Poin</p>
                                    </div>
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