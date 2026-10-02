import { useEffect, useState } from "react";
import { ArrowLeft, Star, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ref, query, orderByChild, onValue } from "firebase/database";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import LoadingSpinner from "../components/LoadingSpinner";

const categories = ["Semua", "Plastik", "Kertas", "Kardus", "Kaleng", "Logam", "Kaca", "Kain", "Karet", "Kayu", "Elektronik", "Tetra Pak", "Styrofoam", "Lainnya"];

const categoryStyle = {
    Plastik: { emoji: "🧴", bg: "bg-blue-50", text: "text-blue-600" },
    Kertas: { emoji: "📄", bg: "bg-amber-50", text: "text-amber-600" },
    Kardus: { emoji: "📦", bg: "bg-orange-50", text: "text-orange-600" },
    Kaleng: { emoji: "🥫", bg: "bg-slate-50", text: "text-slate-600" },
    Logam: { emoji: "🔩", bg: "bg-zinc-50", text: "text-zinc-600" },
    Kaca: { emoji: "🍾", bg: "bg-cyan-50", text: "text-cyan-600" },
    Kain: { emoji: "👕", bg: "bg-pink-50", text: "text-pink-600" },
    Karet: { emoji: "🛞", bg: "bg-neutral-100", text: "text-neutral-700" },
    Kayu: { emoji: "🪵", bg: "bg-stone-100", text: "text-stone-600" },
    Elektronik: { emoji: "🔌", bg: "bg-purple-50", text: "text-purple-600" },
    "Tetra Pak": { emoji: "🧃", bg: "bg-lime-50", text: "text-lime-600" },
    Styrofoam: { emoji: "⬜", bg: "bg-sky-50", text: "text-sky-600" },
    Lainnya: { emoji: "♻️", bg: "bg-gray-100", text: "text-gray-600" },
};

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function ScanHistory() {
    const navigate = useNavigate();
    const { user, authUser, loading } = useAuth();

    const [deposits, setDeposits] = useState([]);
    const [depositsLoading, setDepositsLoading] = useState(true);
    const [query_, setQuery_] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");

    useEffect(() => {
        if (!authUser) return;

        const depositsRef = query(ref(db, `deposits/${authUser.uid}`), orderByChild("timestamp"));
        const unsubscribe = onValue(depositsRef, (snapshot) => {
            if (snapshot.exists()) {
                const list = Object.entries(snapshot.val())
                    .map(([id, value]) => ({ id, ...value }))
                    .reverse();
                setDeposits(list);
            } else {
                setDeposits([]);
            }
            setDepositsLoading(false);
        });

        return () => unsubscribe();
    }, [authUser]);

    if (loading || depositsLoading || !user) return <LoadingSpinner />;

    const totalSetoran = user.totalSetoran || 0;
    const totalPoinSetoran = deposits.reduce((sum, item) => sum + (item.points || 0), 0);

    const filtered = deposits.filter((item) => {
        const matchCategory = activeCategory === "Semua" || item.category === activeCategory;
        const matchQuery = item.category.toLowerCase().includes(query_.toLowerCase());
        return matchCategory && matchQuery;
    });

    return (
        <div className="relative w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-gray-50 flex flex-col">
            <div className="bg-linear-to-br from-primary to-[#009923] pt-5 pb-6 px-4 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
                        <ArrowLeft className="w-4.5 h-4.5 text-white" />
                    </button>
                    <div className="flex flex-col">
                        <p className="font-poppins-bold text-white text-[16px]">Riwayat Setoran</p>
                        <p className="font-poppins-medium text-white/80 text-[11px]">Lihat semua aktivitas penyetoran sampah</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center border border-white/20">
                        <p className="font-poppins-bold text-white text-[20px]">{totalSetoran} Kali</p>
                        <p className="font-poppins-medium text-white/80 text-[10px]">Total Setoran</p>
                    </div>
                    <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center border border-white/20">
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-secondary fill-secondary" />
                            <span className="font-poppins-bold text-white text-[20px]">{totalPoinSetoran.toLocaleString("id-ID")}</span>
                        </span>
                        <p className="font-poppins-medium text-white/80 text-[10px]">Total Eco Poin</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 mt-3 pb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 px-3 py-2.5 mb-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        value={query_}
                        onChange={(e) => setQuery_(e.target.value)}
                        placeholder="Cari kategori sampah..."
                        className="flex-1 font-poppins-medium text-[12px] text-gray-700 outline-none placeholder:text-gray-400"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-4 py-1.5 rounded-full font-poppins-semibold text-[12px] border transition-colors cursor-pointer ${activeCategory === cat ? "bg-primary border-primary text-white" : "bg-white border-primary/30 text-primary"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-2.5">
                    {filtered.map((item) => {
                        const style = categoryStyle[item.category] ?? categoryStyle.Lainnya;
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2.5 flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center text-2xl shrink-0`}>
                                    {style.emoji}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <p className="font-poppins-semibold text-gray-800 text-[12.5px]">{item.category}</p>
                                    <p className="font-poppins-medium text-gray-400 text-[10.5px]">{formatDate(item.timestamp)} • Skor {item.skor}%</p>
                                </div>
                                <span className="font-poppins-bold text-primary text-[12px]">+{item.points} Eco Point</span>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <p className="font-poppins-medium text-gray-400 text-[12px] text-center mt-8">
                            {deposits.length === 0 ? "Belum ada riwayat setoran" : "Tidak ada hasil ditemukan"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}