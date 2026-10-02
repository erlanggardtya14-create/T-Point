import { ArrowLeft, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, query, orderByChild, onValue } from "firebase/database";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

const categories = ["Semua", "Alat Tulis", "Perlengkapan"];

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function RewardHistory() {
    const { authUser, loading } = useAuth();
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [query_, setQuery_] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");

    useEffect(() => {
        if (!authUser) return;

        const redemptionsRef = query(ref(db, `redemptions/${authUser.uid}`), orderByChild("timestamp"));
        const unsubscribe = onValue(redemptionsRef, (snapshot) => {
            if (snapshot.exists()) {
                const list = Object.entries(snapshot.val())
                    .map(([id, value]) => ({ id, ...value }))
                    .reverse();
                setHistory(list);
            } else {
                setHistory([]);
            }
            setHistoryLoading(false);
        });

        return () => unsubscribe();
    }, [authUser]);

    if (loading || historyLoading) return <LoadingSpinner />;

    const filtered = history.filter((item) => {
        const matchCategory = activeCategory === "Semua" || item.category === activeCategory;
        const matchQuery = item.rewardName.toLowerCase().includes(query_.toLowerCase());
        return matchCategory && matchQuery;
    });

    return (
        <div className="relative w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-gray-50 flex flex-col">
            <div className="bg-linear-to-br from-primary to-[#009923] pt-5 pb-6 px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
                        <ArrowLeft className="w-4.5 h-4.5 text-white" />
                    </button>
                    <div className="flex flex-col">
                        <p className="font-poppins-bold text-white text-[16px]">Penukaran</p>
                        <p className="font-poppins-medium text-white/80 text-[11px]">Lihat hadiah yang anda tukarkan</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 -mt-3">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 px-3 py-2.5 mb-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        value={query_}
                        onChange={(e) => setQuery_(e.target.value)}
                        placeholder="Cari Hadiah"
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

                <div className="flex flex-col gap-2.5 pb-6">
                    {filtered.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2.5 flex items-center gap-3">
                            <img src={item.imageUrl} alt={item.rewardName} className="w-12 h-12 rounded-xl object-cover" />
                            <div className="flex flex-col flex-1">
                                <p className="font-poppins-semibold text-gray-800 text-[12.5px]">{item.rewardName}</p>
                                <p className="font-poppins-medium text-gray-400 text-[10.5px]">{formatDate(item.timestamp)}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-secondary fill-secondary" />
                                    <span className="font-poppins-bold text-gray-700 text-[12px]">{item.points.toLocaleString("id-ID")}</span>
                                </span>
                                <p className="font-poppins-medium text-gray-400 text-[9px]">Poin</p>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <p className="font-poppins-medium text-gray-400 text-[12px] text-center mt-8">
                            {history.length === 0 ? "Belum ada riwayat penukaran" : "Tidak ada hasil ditemukan"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}