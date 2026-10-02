import { useState } from "react";
import logo from "/logo/logo.png";
import { Eye, EyeOff, Calendar, ChevronDown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "../lib/firebase";

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.31 14.34c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.69H1.3A11.97 11.97 0 000 12.06c0 1.93.46 3.76 1.3 5.37l4.01-3.09z" />
            <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.69l4.01 3.09c.94-2.82 3.58-4.92 6.69-5.03z" />
        </svg>
    );
}

function getAuthErrorMessage(err) {
    if (err.code === "auth/email-already-in-use") return "Email sudah terdaftar";
    if (err.code === "auth/weak-password") return "Kata sandi minimal 6 karakter";
    if (err.code === "auth/invalid-email") return "Format email tidak valid";
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") return "Email atau kata sandi salah";
    if (err.code === "auth/popup-closed-by-user") return "Popup Google ditutup sebelum selesai";
    if (err.code === "auth/unauthorized-domain") return "Domain ini belum diizinkan di Firebase Console";
    if (err.code === "auth/operation-not-allowed") return "Metode login ini belum diaktifkan di Firebase Console";
    return `Terjadi kesalahan (${err.code || err.message})`;
}

async function createProfileIfMissing(user) {
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) return;

    await set(userRef, {
        name: user.displayName || "",
        email: user.email || "",
        className: "",
        avatarUrl: user.photoURL || "",
        ecoPoint: 0,
        totalSetoran: 0,
        totalSampah: 0,
        level: "Eco Rookie",
        createdAt: Date.now(),
    });
}

function Login({ setMode }) {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Email dan kata sandi wajib diisi");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/beranda");
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            await createProfileIfMissing(result.user);
            navigate("/beranda");
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-between w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white p-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="logo" className="w-10 h-auto" />
                    <h1 className="font-poppins-bold text-xl">
                        Trash <span className="text-primary">Point</span>
                    </h1>
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="font-poppins-bold text-2xl leading-tight">Masuk ke Akun Anda</h1>
                    <p className="font-poppins-medium text-gray-500 text-[12px]">Masukkan email dan kata sandi untuk masuk</p>
                </div>

                <div className="flex flex-col gap-4">
                    {error && <p className="font-poppins-medium text-red-500 text-[12px]">{error}</p>}

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Masukkan email Anda"
                            className="border border-gray-300 rounded-lg px-4 py-3 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan kata sandi Anda"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <p className="text-primary font-poppins-semibold text-[12px] text-right cursor-pointer">Lupa Kata Sandi?</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-linear-to-r from-primary to-green-800 py-3.5 text-white font-poppins-bold text-[14px] rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Memproses..." : "Masuk"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <p className="font-poppins-medium text-gray-400 text-[12px]">Atau</p>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="border border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 font-poppins-semibold text-[13px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <GoogleIcon />
                    Lanjutkan dengan Google
                </button>

                <p className="text-center font-poppins-medium text-gray-500 text-[12px] mt-2">
                    Belum punya akun?{" "}
                    <span onClick={() => setMode("signup")} className="text-primary font-poppins-semibold cursor-pointer">
                        Daftar
                    </span>
                </p>
            </div>
        </div>
    );
}

function SignUp({ setMode }) {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [phone, setPhone] = useState("");
    const [className, setClassName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            setError("Nama, email, dan kata sandi wajib diisi");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(credential.user, { displayName: name });
            await set(ref(db, `users/${credential.user.uid}`), {
                name,
                email,
                birthDate,
                phone,
                className,
                avatarUrl: "",
                ecoPoint: 0,
                totalSetoran: 0,
                totalSampah: 0,
                level: "Eco Rookie",
                createdAt: Date.now(),
            });
            navigate("/beranda");
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            await createProfileIfMissing(result.user);
            navigate("/beranda");
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white p-6">
            <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar">
                <ArrowLeft onClick={() => setMode("login")} className="w-5 h-5 cursor-pointer" />

                <div className="flex flex-col gap-1">
                    <h1 className="font-poppins-bold text-2xl leading-tight">Daftar</h1>
                    <p className="font-poppins-medium text-gray-500 text-[12px]">Buat akun untuk melanjutkan!</p>
                </div>

                <div className="flex flex-col gap-3">
                    {error && <p className="font-poppins-medium text-red-500 text-[12px]">{error}</p>}

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Nama Lengkap</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masukkan nama Anda"
                            className="border border-gray-300 rounded-lg px-4 py-3 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Kelas</label>
                        <input
                            type="text"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="Masukkan kelas Anda"
                            className="border border-gray-300 rounded-lg px-4 py-3 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Masukkan email Anda"
                            className="border border-gray-300 rounded-lg px-4 py-3 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Tanggal Lahir</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                placeholder="Masukkan tanggal lahir Anda"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Nomor Telepon</label>
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1">
                            <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
                                <span className="text-lg">🇮🇩</span>
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Masukkan nomor Anda"
                                className="flex-1 px-3 py-2 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-[13px]">Buat Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan kata sandi Anda"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSignUp}
                    disabled={loading}
                    className="bg-linear-to-r from-primary to-green-800 py-3.5 text-white font-poppins-bold text-[14px] rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Memproses..." : "Daftar"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <p className="font-poppins-medium text-gray-400 text-[12px]">Atau</p>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="border border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 font-poppins-semibold text-[13px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <GoogleIcon />
                    Daftar dengan Google
                </button>
            </div>

            <p className="text-center font-poppins-medium text-gray-500 text-[12px] py-4 shrink-0">
                Sudah punya akun?{" "}
                <span onClick={() => setMode("login")} className="text-primary font-poppins-semibold cursor-pointer">
                    Masuk
                </span>
            </p>
        </div>
    );
}

export default function Auth() {
    const [mode, setMode] = useState("login");

    return (
        <div className="w-full h-screen overflow-hidden">
            {mode === "login" ? <Login setMode={setMode} /> : <SignUp setMode={setMode} />}
        </div>
    );
}