import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Recycle,
    LayoutGrid,
    History,
    Users,
    BarChart3,
    Gift,
    FileText,
    User,
    Search,
    Bell,
    LogOut,
    Menu,
    X,
} from "lucide-react";

const menuItems = [
    { label: "Dashboard", icon: LayoutGrid, to: "/dashboard" },
    { label: "Riwayat Setoran", icon: History, to: "/riwayat-setoran" },
    { label: "Data Siswa", icon: Users, to: "/data-siswa" },
    { label: "Leaderboard", icon: BarChart3, to: "/leaderboard" },
    { label: "Penukaran Hadiah", icon: Gift, to: "/penukaran-hadiah" },
    { label: "Laporan", icon: FileText, to: "/laporan" },
    { label: "Profil", icon: User, to: "/profil" },
];

export default function DashboardLayout({ title = "Dashboard", subtitle, children }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, authUser, logout } = useAuth();
    const navigate = useNavigate();

    const userName = user?.name || authUser?.displayName || "Pengguna";
    const userRole = user?.role || "Penanggung Jawab";
    const userPhoto = user?.photoURL || authUser?.photoURL || "";

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="h-screen w-full bg-gray-50 font-poppins-regular flex overflow-hidden">
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 shrink-0 h-full bg-white border-r border-gray-100 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div>
                    <div className="flex items-center justify-between px-6 py-5">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Recycle className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-poppins-semibold text-sm text-gray-900 leading-tight">
                                    TrashPoint
                                </p>
                                <p className="font-poppins-regular text-[11px] text-gray-400 leading-tight">
                                    Admin Dashboard
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="px-6 mt-2 mb-2 font-poppins-semibold text-[10px] tracking-wider text-gray-400">
                        MENU UTAMA
                    </p>

                    <nav className="px-3 space-y-1">
                        {menuItems.map(({ label, icon: Icon, to }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-poppins-medium text-sm transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-500 hover:bg-gray-50"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className="flex items-center gap-3">
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </span>
                                        {isActive && (
                                            <span className="w-1 h-4 rounded-full bg-primary" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="border-t border-gray-100">
                    <Link
                        to="/profil"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50"
                    >
                        {userPhoto ? (
                            <img
                                src={userPhoto}
                                alt={userName}
                                className="w-9 h-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-poppins-medium text-sm text-gray-800 truncate">
                                {userName}
                            </p>
                            <p className="font-poppins-regular text-[11px] text-gray-400 truncate">
                                {userRole}
                            </p>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-3 font-poppins-medium text-sm text-red-500 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            <div className="flex-1 h-full flex flex-col min-w-0">
                <header className="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-9 h-9 shrink-0 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center"
                        >
                            <Menu className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="font-poppins-bold text-lg sm:text-xl text-gray-900 truncate">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="hidden sm:block font-poppins-regular text-xs text-gray-400 mt-0.5 truncate">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2 w-56 lg:w-64">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari siswa, transaksi..."
                                className="w-full bg-transparent text-sm font-poppins-regular text-gray-700 placeholder:text-gray-400 outline-none"
                            />
                        </div>

                        <button
                            type="button"
                            className="md:hidden relative w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center"
                        >
                            <Search className="w-4 h-4 text-gray-500" />
                        </button>

                        <button
                            type="button"
                            className="relative w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center"
                        >
                            <Bell className="w-4 h-4 text-gray-500" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                        </button>

                        <Link to="/profil" className="flex items-center gap-2.5">
                            {userPhoto ? (
                                <img
                                    src={userPhoto}
                                    alt={userName}
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className="hidden lg:block">
                                <p className="font-poppins-medium text-sm text-gray-800 leading-tight">
                                    {userName}
                                </p>
                                <p className="font-poppins-regular text-[11px] text-gray-400 leading-tight">
                                    {userRole}
                                </p>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}