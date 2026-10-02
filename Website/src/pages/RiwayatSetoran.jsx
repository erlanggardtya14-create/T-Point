import React, { useEffect, useMemo, useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "../lib/firebase";
import DashboardLayout from "../components/DashboardLayout";
import {
    Search,
    Recycle,
    Star,
    BarChart3,
    Calendar,
    Download,
    GraduationCap,
    X,
} from "lucide-react";

const PAGE_SIZE = 8;

function formatTanggal(timestamp) {
    const d = new Date(timestamp);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTanggalInput(timestamp) {
    const d = new Date(timestamp);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const categoryStyle = {
    Plastik: "bg-blue-50 text-blue-600",
    Kertas: "bg-amber-50 text-amber-600",
    Kaleng: "bg-red-50 text-red-500",
    Kardus: "bg-emerald-50 text-emerald-600",
    Kaca: "bg-cyan-50 text-cyan-600",
    Logam: "bg-slate-100 text-slate-600",
    Organik: "bg-lime-50 text-lime-600",
    Lainnya: "bg-gray-100 text-gray-600",
};

export default function RiwayatSetoran() {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
    const [jenisFilter, setJenisFilter] = useState("Semua Jenis");
    const [tanggalFilter, setTanggalFilter] = useState("");
    const [page, setPage] = useState(1);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [depositsSnap, usersSnap] = await Promise.all([
                get(ref(db, "deposits")),
                get(ref(db, "users")),
            ]);

            const users = usersSnap.exists() ? usersSnap.val() : {};
            const depositsVal = depositsSnap.exists() ? depositsSnap.val() : {};

            const flat = [];
            Object.entries(depositsVal).forEach(([userId, userDeposits]) => {
                Object.entries(userDeposits).forEach(([depositId, deposit]) => {
                    flat.push({
                        id: depositId,
                        userId,
                        studentName: users[userId]?.name || "Tidak Diketahui",
                        className: users[userId]?.className || "-",
                        category: deposit.category || "Lainnya",
                        points: deposit.points ?? 0,
                        skor: deposit.skor ?? 0,
                        timestamp: deposit.timestamp,
                    });
                });
            });

            flat.sort((a, b) => b.timestamp - a.timestamp);
            setDeposits(flat);
            setLoading(false);
        };

        fetchData();
    }, []);

    const kelasList = useMemo(() => {
        const unique = new Set(
            deposits.map((d) => d.className).filter((c) => c && c !== "-")
        );
        return ["Semua Kelas", ...Array.from(unique).sort()];
    }, [deposits]);

    const jenisList = useMemo(() => {
        const unique = new Set(deposits.map((d) => d.category));
        return ["Semua Jenis", ...Array.from(unique).sort()];
    }, [deposits]);

    const filtered = useMemo(() => {
        return deposits.filter((d) => {
            const matchSearch = d.studentName
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchKelas =
                kelasFilter === "Semua Kelas" || d.className === kelasFilter;
            const matchJenis =
                jenisFilter === "Semua Jenis" || d.category === jenisFilter;
            const matchTanggal =
                !tanggalFilter || formatTanggalInput(d.timestamp) === tanggalFilter;
            return matchSearch && matchKelas && matchJenis && matchTanggal;
        });
    }, [deposits, searchTerm, kelasFilter, jenisFilter, tanggalFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const totalSetoran = deposits.length;
    const totalEcoPoint = deposits.reduce((sum, d) => sum + d.points, 0);
    const rataRataPoint =
        totalSetoran > 0 ? Math.round(totalEcoPoint / totalSetoran) : 0;

    const handleExport = () => {
        const header = [
            "Tanggal",
            "Nama Siswa",
            "Kelas",
            "Jenis Sampah",
            "Skor",
            "Eco Point",
        ];
        const rows = filtered.map((d) => [
            formatTanggal(d.timestamp),
            d.studentName,
            d.className,
            d.category,
            d.skor,
            d.points,
        ]);
        const csv = [header, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "riwayat-setoran.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout
            title="Riwayat Setoran"
            subtitle="Pantau seluruh aktivitas penyetoran sampah oleh siswa."
        >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Recycle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="font-poppins-bold text-lg text-gray-900">
                            {totalSetoran}
                        </p>
                        <p className="font-poppins-regular text-xs text-gray-400">
                            Total Setoran
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="font-poppins-bold text-lg text-gray-900">
                            {totalEcoPoint}
                        </p>
                        <p className="font-poppins-regular text-xs text-gray-400">
                            Total Eco Point
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex items-center gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="font-poppins-bold text-lg text-gray-900">
                            {rataRataPoint}
                        </p>
                        <p className="font-poppins-regular text-xs text-gray-400">
                            Rata-rata Point
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 w-full sm:flex-1 sm:min-w-[200px]">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Cari nama siswa..."
                        className="w-full text-sm font-poppins-regular text-gray-700 placeholder:text-gray-400 outline-none"
                    />
                </div>

                <select
                    value={kelasFilter}
                    onChange={(e) => {
                        setKelasFilter(e.target.value);
                        setPage(1);
                    }}
                    className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-poppins-regular text-gray-700 outline-none min-w-[130px]"
                >
                    {kelasList.map((kelas) => (
                        <option key={kelas} value={kelas}>
                            {kelas}
                        </option>
                    ))}
                </select>

                <select
                    value={jenisFilter}
                    onChange={(e) => {
                        setJenisFilter(e.target.value);
                        setPage(1);
                    }}
                    className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-poppins-regular text-gray-700 outline-none min-w-[130px]"
                >
                    {jenisList.map((jenis) => (
                        <option key={jenis} value={jenis}>
                            {jenis}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 flex-1 sm:flex-none min-w-[150px]">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="date"
                        value={tanggalFilter}
                        onChange={(e) => {
                            setTanggalFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full text-sm font-poppins-regular text-gray-700 outline-none"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-emerald-700 transition-colors text-white font-poppins-semibold text-sm rounded-xl px-4 py-2.5 w-full sm:w-auto"
                >
                    <Download className="w-4 h-4" />
                    Export Excel
                </button>
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-3 font-poppins-medium text-[11px] tracking-wide text-gray-400 whitespace-nowrap">
                                    TANGGAL
                                </th>
                                <th className="px-6 py-3 font-poppins-medium text-[11px] tracking-wide text-gray-400 whitespace-nowrap">
                                    NAMA SISWA
                                </th>
                                <th className="px-6 py-3 font-poppins-medium text-[11px] tracking-wide text-gray-400 whitespace-nowrap">
                                    KELAS
                                </th>
                                <th className="px-6 py-3 font-poppins-medium text-[11px] tracking-wide text-gray-400 whitespace-nowrap">
                                    JENIS SAMPAH
                                </th>
                                <th className="px-6 py-3 font-poppins-medium text-[11px] tracking-wide text-gray-400 whitespace-nowrap">
                                    SKOR
                                </th>
                                <th className="px-6 py-3 font-poppins-medium text-[11px] tracking-wide text-gray-400 whitespace-nowrap">
                                    ECO POINT
                                </th>
                                <th className="px-6 py-3 font-poppins-medium text-[11px] tracking-wide text-gray-400" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-8 text-center font-poppins-regular text-sm text-gray-400"
                                    >
                                        Memuat data...
                                    </td>
                                </tr>
                            )}

                            {!loading && paginated.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-8 text-center font-poppins-regular text-sm text-gray-400"
                                    >
                                        Tidak ada data setoran.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                paginated.map((d) => (
                                    <tr
                                        key={d.id}
                                        className="border-b border-gray-50 last:border-0"
                                    >
                                        <td className="px-6 py-4 font-poppins-regular text-xs text-gray-400 whitespace-nowrap">
                                            {formatTanggal(d.timestamp)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2 font-poppins-semibold text-sm text-gray-800 whitespace-nowrap">
                                                <GraduationCap className="w-4 h-4 text-primary" />
                                                {d.studentName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-poppins-regular text-sm text-gray-500 whitespace-nowrap">
                                            {d.className}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full font-poppins-medium text-xs whitespace-nowrap ${categoryStyle[d.category] ||
                                                    categoryStyle.Lainnya
                                                    }`}
                                            >
                                                {d.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-poppins-regular text-sm text-gray-600">
                                            {d.skor}
                                        </td>
                                        <td className="px-6 py-4 font-poppins-semibold text-sm text-amber-500 whitespace-nowrap">
                                            +{d.points}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setDetail(d)}
                                                className="font-poppins-semibold text-xs text-primary bg-primary/10 rounded-full px-3.5 py-1.5 hover:bg-primary/20 whitespace-nowrap"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                    <p className="font-poppins-regular text-xs text-gray-400">
                        Menampilkan {paginated.length} dari {filtered.length} setoran
                    </p>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setPage(num)}
                                    className={`w-7 h-7 rounded-lg font-poppins-medium text-xs ${page === num
                                            ? "bg-primary text-white"
                                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                        }`}
                                >
                                    {num}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="md:hidden space-y-3">
                {loading && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center font-poppins-regular text-sm text-gray-400">
                        Memuat data...
                    </div>
                )}

                {!loading && paginated.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center font-poppins-regular text-sm text-gray-400">
                        Tidak ada data setoran.
                    </div>
                )}

                {!loading &&
                    paginated.map((d) => (
                        <div
                            key={d.id}
                            className="bg-white rounded-2xl shadow-sm p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-poppins-semibold text-sm text-gray-800 truncate">
                                            {d.studentName}
                                        </p>
                                        <p className="font-poppins-regular text-xs text-gray-400">
                                            {d.className}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`shrink-0 px-2.5 py-1 rounded-full font-poppins-medium text-xs ${categoryStyle[d.category] ||
                                        categoryStyle.Lainnya
                                        }`}
                                >
                                    {d.category}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                <p className="font-poppins-regular text-xs text-gray-400">
                                    {formatTanggal(d.timestamp)}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="font-poppins-regular text-xs text-gray-500">
                                        Skor {d.skor}
                                    </span>
                                    <span className="font-poppins-semibold text-sm text-amber-500">
                                        +{d.points}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setDetail(d)}
                                className="w-full mt-3 font-poppins-semibold text-xs text-primary bg-primary/10 rounded-xl py-2 hover:bg-primary/20"
                            >
                                Lihat Detail
                            </button>
                        </div>
                    ))}

                {!loading && filtered.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
                        <p className="font-poppins-regular text-xs text-gray-400">
                            {paginated.length} dari {filtered.length}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setPage(num)}
                                        className={`w-7 h-7 rounded-lg font-poppins-medium text-xs ${page === num
                                                ? "bg-primary text-white"
                                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {detail && (
                <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 relative">
                        <button
                            type="button"
                            onClick={() => setDetail(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <h3 className="font-poppins-bold text-lg text-gray-900 mb-4">
                            Detail Setoran
                        </h3>
                        <div className="space-y-2.5 font-poppins-regular text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Nama Siswa</span>
                                <span className="font-poppins-medium text-gray-800">
                                    {detail.studentName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kelas</span>
                                <span className="font-poppins-medium text-gray-800">
                                    {detail.className}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tanggal</span>
                                <span className="font-poppins-medium text-gray-800">
                                    {formatTanggal(detail.timestamp)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Jenis Sampah</span>
                                <span className="font-poppins-medium text-gray-800">
                                    {detail.category}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Skor</span>
                                <span className="font-poppins-medium text-gray-800">
                                    {detail.skor}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Eco Point</span>
                                <span className="font-poppins-medium text-amber-500">
                                    +{detail.points}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}