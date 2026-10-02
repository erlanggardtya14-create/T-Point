import { useNavigate } from "react-router-dom";
import { Camera, Star, Trophy, Recycle, Award, User, Gift, History, ClipboardList, LogOut, ChevronRight } from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../lib/firebase";

const menuItems = [
    { icon: User, label: "Ubah Data Akun", desc: "Ubah detail diri Anda", path: "/edit-profile" },
    { icon: Gift, label: "Riwayat Penukaran", desc: "Lihat hadiah yang sudah ditukar", path: "/reward-history" },
    { icon: History, label: "Riwayat Setoran", desc: "Lihat aktivitas penyetoran sampah", path: "/scan-history" },
    { icon: ClipboardList, label: "Pencapaian", desc: "Lihat semua badge yang didapat", path: "/achievement-history" },
];

export default function Profile() {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth()
    const [rank, setRank] = useState(null);

    if (loading || !user) return <LoadingSpinner />;

    const target = Math.max(500, Math.ceil((user.ecoPoint + 1) / 500) * 500);
    const progressPercent = Math.min(100, Math.round((user.ecoPoint / target) * 100));
    const badgeCount = user.badges ? Object.keys(user.badges).length : 0;
    const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=00BF2A&color=fff&bold=true&size=128`;

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

    useEffect(() => {
        if (!user?.uid) return;

        const usersRef = ref(db, "users");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (!snapshot.exists()) {
                setRank(null);
                return;
            }

            const users = Object.entries(snapshot.val())
                .map(([uid, value]) => ({
                    uid,
                    ...value,
                    ecoPoint: value.ecoPoint || 0,
                }))
                .sort((a, b) => b.ecoPoint - a.ecoPoint);

            const index = users.findIndex((item) => item.uid === user.uid);

            setRank(index !== -1 ? index + 1 : null);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return (
        <div className="relative w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white flex flex-col">
            <div className="flex-1 overflow-y-auto pb-28">
                <div className="bg-linear-to-br from-primary to-[#009923] rounded-b-4xl pt-8 pb-8 px-4 relative overflow-hidden flex flex-col items-center">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
                    <div className="absolute top-24 -left-10 w-24 h-24 rounded-full bg-white/10 blur-lg" />

                    <div className="relative w-24 h-24 mb-3">
                        <img src={avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover border-4 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.35)]" />
                        <button
                            onClick={() => navigate("/edit-profile")}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer active:scale-95 transition-transform"
                        >
                            <Camera className="w-4 h-4 text-primary" />
                        </button>
                    </div>

                    <p className="relative font-poppins-bold text-white text-[17px]">{user.name || "Tanpa Nama"}</p>
                    <p className="relative font-poppins-medium text-white/80 text-[11px] mb-2">{user.className || "Kelas belum diatur"}</p>
                    <span className="relative bg-white/20 px-3 py-1 rounded-full font-poppins-semibold text-white text-[11px]">
                        {user.level || "Eco Rookie"}
                    </span>
                </div>

                <div className="px-4 -mt-4 relative">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="font-poppins-semibold text-gray-500 text-[11px]">Progress</p>
                            <p className="font-poppins-bold text-gray-700 text-[11px]">{user.ecoPoint}/{target}</p>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-4 mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-amber-50 rounded-2xl p-3.5 flex flex-col gap-1">
                        <Star className="w-5 h-5 text-secondary fill-secondary" />
                        <p className="font-poppins-bold text-gray-800 text-[18px]">{(user.ecoPoint || 0).toLocaleString("id-ID")}</p>
                        <p className="font-poppins-medium text-amber-600 text-[10px]">Eco Point</p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-3.5 flex flex-col gap-1">
                        <Trophy className="w-5 h-5 text-blue-500" />
                        <p className="font-poppins-bold text-gray-800 text-[18px]">
                            {rank ? `#${rank}` : "-"}
                        </p>
                        <p className="font-poppins-medium text-blue-500 text-[10px]">Peringkat</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-3.5 flex flex-col gap-1">
                        <Recycle className="w-5 h-5 text-primary" />
                        <p className="font-poppins-bold text-gray-800 text-[18px]">{user.totalSampah || 0}</p>
                        <p className="font-poppins-medium text-primary text-[10px]">Jumlah Sampah</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-3.5 flex flex-col gap-1">
                        <Award className="w-5 h-5 text-purple-500" />
                        <p className="font-poppins-bold text-gray-800 text-[18px]">{badgeCount}</p>
                        <p className="font-poppins-medium text-purple-500 text-[10px]">Lencana</p>
                    </div>
                </div>

                <div className="px-4 mt-5">
                    <p className="font-poppins-bold text-gray-800 text-[13px] mb-2">Informasi Akun</p>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {menuItems.map((item, index) => (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 p-3 cursor-pointer active:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
                                    }`}
                            >
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <item.icon className="w-4.5 h-4.5 text-primary" />
                                </div>
                                <div className="flex flex-col items-start flex-1">
                                    <p className="font-poppins-semibold text-gray-800 text-[12.5px]">{item.label}</p>
                                    <p className="font-poppins-medium text-gray-400 text-[10px]">{item.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 mt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 text-red-500 font-poppins-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar Akun
                    </button>
                </div>
            </div>

            <BottomNavbar />
        </div>
    );
}