import React, { useState } from "react";
import backgroundImage from "/image/login.png"
import logo from "/logo/logo.png"
import { useNavigate, Link } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../lib/firebase";
import {
    Recycle,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Loader2,
} from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const verifyRoleAndRedirect = async (uid) => {
        const snapshot = await get(ref(db, `admin/${uid}`));
        if (!snapshot.exists()) {
            await signOut(auth);
            setError("Akun ini tidak terdaftar sebagai Penanggung Jawab.");
            return;
        }
        navigate("/beranda");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await setPersistence(
                auth,
                browserLocalPersistence
            );
            const { user } = await signInWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );

            await verifyRoleAndRedirect(user.uid);
        } catch (err) {
            setError("Email atau password salah.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-poppins-regular">
            <div className="relative bg-gradient-to-br from-primary via-emerald-600 to-emerald-900 p-8 lg:p-12 hidden lg:flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <img className="w-5 h-auto" src={logo} alt="Logo" />
                        </div>
                        <span className="font-poppins-semibold text-white text-lg">
                            TrashPoint
                        </span>
                    </div>

                    <div className="mt-6 inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span className="font-poppins-medium text-[11px] tracking-wide text-white">
                            SMART WASTE MANAGEMENT
                        </span>
                    </div>

                    <h1 className="mt-4 font-poppins-bold text-3xl leading-tight text-white">
                        Selamat Datang di
                        <br />
                        TrashPoint
                    </h1>

                    <p className="mt-3 font-poppins-regular text-sm text-emerald-50/90 max-w-[360px]">
                        Kelola aktivitas Bank Sampah Digital, pantau Eco Point siswa,
                        serta monitoring sistem secara real-time.
                    </p>

                    <img src={backgroundImage} alt="" />
                </div>
            </div>

            <div className="bg-gray-50 flex flex-col items-center justify-center p-6 lg:p-10">
                <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-6 lg:p-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Recycle className="w-7 h-7 text-primary" />
                    </div>

                    <h2 className="font-poppins-bold text-2xl text-gray-900">
                        Masuk
                    </h2>
                    <p className="font-poppins-regular text-sm text-gray-500 mt-1">
                        Silakan masuk menggunakan akun Penanggung Jawab.
                    </p>

                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-xs font-poppins-regular rounded-xl px-3.5 py-2.5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="font-poppins-medium text-xs text-gray-700">
                                Email
                            </label>
                            <div className="mt-1.5 flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    disabled={loading}
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="nama@sekolah.sch.id"
                                    className="w-full text-sm font-poppins-regular text-gray-800 placeholder:text-gray-400 outline-none disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-poppins-medium text-xs text-gray-700">
                                Password
                            </label>
                            <div className="mt-1.5 flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    disabled={loading}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Masukkan password"
                                    className="w-full text-sm font-poppins-regular text-gray-800 placeholder:text-gray-400 outline-none disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-emerald-700 transition-colors text-white font-poppins-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Masuk
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-poppins-regular text-[11px] text-gray-400">
                        Data Anda terlindungi dan terenkripsi
                    </span>
                </div>
            </div>
        </div>
    );
}