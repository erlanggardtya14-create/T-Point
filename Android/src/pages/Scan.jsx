import { useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    ScanLine,
    Camera,
    RotateCcw,
    Trash2,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyzeTrashImage } from "../lib/gemini";
import {
    requestOpenBin,
    closeSmartBin,
    logDeposit,
    waitForDeposit,
} from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const DEPOSIT_TIMEOUT_MS = 120000;
const OPEN_BIN_TIMEOUT_MS = 5000;

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

function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function CameraCapture({ onCapture, onFull }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);
    const [checking, setChecking] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        async function startCamera() {
            if (!window.isSecureContext) {
                setError("Kamera cuma bisa diakses lewat HTTPS dan localhost.");
                return;
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                setError("Browser ini tidak mendukung akses kamera.");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                });

                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    try {
                        await videoRef.current.play();

                        if (!cancelled) {
                            setReady(true);
                        }
                    } catch (playErr) {
                        if (playErr.name !== "AbortError" && !cancelled) {
                            setError("Tidak bisa memutar video kamera.");
                        }
                    }
                }
            } catch (err) {
                if (cancelled || err.name === "AbortError") {
                    return;
                }

                console.error("Camera error:", err.name, err.message);

                if (
                    err.name === "NotAllowedError" ||
                    err.name === "PermissionDeniedError"
                ) {
                    setError("Izin kamera ditolak. Cek izin kamera browser.");
                } else if (
                    err.name === "NotFoundError" ||
                    err.name === "DevicesNotFoundError"
                ) {
                    setError("Kamera tidak ditemukan.");
                } else if (
                    err.name === "NotReadableError" ||
                    err.name === "TrackStartError"
                ) {
                    setError("Kamera sedang dipakai aplikasi lain.");
                } else if (err.name === "OverconstrainedError") {
                    try {
                        const fallbackStream =
                            await navigator.mediaDevices.getUserMedia({
                                video: true,
                            });

                        if (cancelled) {
                            fallbackStream
                                .getTracks()
                                .forEach((track) => track.stop());
                            return;
                        }

                        streamRef.current = fallbackStream;

                        if (videoRef.current) {
                            videoRef.current.srcObject = fallbackStream;
                            await videoRef.current.play();

                            if (!cancelled) {
                                setReady(true);
                            }
                        }
                    } catch {
                        if (!cancelled) {
                            setError("Tidak bisa mengakses kamera.");
                        }
                    }
                } else {
                    setError(
                        `Tidak bisa mengakses kamera (${err.name || "unknown"}).`
                    );
                }
            }
        }

        startCamera();

        return () => {
            cancelled = true;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, []);

    const handleCapture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !video.videoWidth || checking) {
            return;
        }

        setChecking(true);

        try {
            const granted = await requestOpenBin(OPEN_BIN_TIMEOUT_MS);

            if (!granted) {
                onFull();
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("Tidak bisa membuat canvas.");
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
            const base64 = dataUrl.split(",")[1];

            if (!base64) {
                throw new Error("Gagal mengambil gambar.");
            }

            onCapture(base64);
        } catch (error) {
            console.error("Open bin error:", error);
            onFull();
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="flex flex-col justify-between w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-neutral-900 p-4">
            <div className="flex items-center justify-between shrink-0">
                <ArrowLeft
                    onClick={() => navigate(-1)}
                    className="w-5 h-5 text-white cursor-pointer"
                />

                <div className="flex flex-col items-center">
                    <p className="font-poppins-bold text-white text-[15px]">
                        Pindai Sampah
                    </p>

                    <p className="font-poppins-medium text-gray-400 text-[10px]">
                        Arahkan kamera ke sampah
                    </p>
                </div>

                <div className="w-5" />
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0 py-4 relative">
                {error ? (
                    <p className="font-poppins-medium text-red-400 text-[12px] text-center px-6">
                        {error}
                    </p>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover rounded-lg"
                        />
                        {ready && !checking && (
                            <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-primary/60">
                                <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                                <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                                <span className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                                <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                                <div className="absolute inset-x-0 h-0.5 bg-primary/80 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)] animate-scan-line" />
                            </div>
                        )}
                    </>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
                <p className="font-poppins-medium text-gray-400 text-[11px]">
                    {checking
                        ? "Membuka tempat sampah..."
                        : "Pastikan sampah terlihat jelas di kamera"}
                </p>

                <button
                    onClick={handleCapture}
                    disabled={!!error || !ready || checking}
                    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mt-2 mb-2 shadow-[0_0_0_4px_rgba(34,197,94,0.25)] animate-pulse-ring cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Camera className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
}

function WaitingDeposit({ remainingMs }) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen max-w-107.5 mx-auto bg-white p-6 text-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping-slow" />
                <span className="absolute inset-2 rounded-full bg-primary/10 animate-ping-slower" />
                <div className="relative w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                    <Trash2 className="w-9 h-9 text-primary" />
                </div>
            </div>

            <p className="font-poppins-bold text-xl mt-6">
                Silakan Masukkan Sampah
            </p>

            <p className="font-poppins-medium text-gray-500 text-[12px] mt-2 max-w-xs">
                Tempat sampah sudah terbuka. Masukkan sampah sekarang.
            </p>

            <div className="mt-6 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="font-poppins-bold text-[12px] text-gray-600 ml-1">
                    {formatCountdown(remainingMs)}
                </span>
            </div>

            <p className="font-poppins-medium text-gray-400 text-[10px] mt-6">
                Sistem akan otomatis mendeteksi sampah
            </p>
        </div>
    );
}

function Analyzing({ progress }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-linear-to-b from-green-50 to-white p-6 pt-10">
            <span className="bg-green-100 text-primary font-poppins-semibold text-[11px] px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI sedang memproses...
            </span>

            <h1 className="font-poppins-bold text-xl mt-4 text-center">
                Menganalisis Sampah
            </h1>

            <p className="font-poppins-medium text-gray-500 text-[12px] text-center mt-1 px-4">
                AI sedang mengenali jenis, kualitas, dan jumlah sampah...
            </p>

            <div className="flex-1 flex items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="absolute -rotate-90 w-36 h-36">
                        <circle
                            cx="72"
                            cy="72"
                            r={radius}
                            fill="none"
                            stroke="#dcfce7"
                            strokeWidth="8"
                        />
                        <circle
                            cx="72"
                            cy="72"
                            r={radius}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-200 ease-out"
                        />
                    </svg>

                    <div className="w-24 h-24 rounded-full bg-white shadow-inner flex items-center justify-center overflow-hidden relative">
                        <ScanLine className="w-10 h-10 text-primary animate-float" />
                        <div className="absolute inset-x-3 h-0.5 bg-primary/70 shadow-[0_0_6px_2px_rgba(34,197,94,0.5)] animate-scan-line" />
                    </div>

                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
            </div>

            <div className="w-full flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="font-poppins-medium text-gray-500 text-[11px]">
                        Progres Analisis
                    </p>

                    <p className="font-poppins-bold text-[11px]">{progress}%</p>
                </div>

                <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-primary to-green-600 rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function ErrorScreen({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white p-6 text-center">
            <p className="font-poppins-bold text-lg">Setoran Gagal</p>

            <p className="font-poppins-medium text-gray-500 text-[12px]">
                {message}
            </p>

            <button
                onClick={onRetry}
                className="flex items-center gap-2 bg-primary text-white font-poppins-bold text-[13px] px-5 py-3 rounded-xl cursor-pointer"
            >
                <RotateCcw className="w-4 h-4" />
                Coba Lagi
            </button>
        </div>
    );
}

function FullBin({ onRetry, onLeave }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-9 h-9 text-red-500" />
            </div>

            <p className="font-poppins-bold text-lg">Tempat Sampah Penuh</p>

            <p className="font-poppins-medium text-gray-500 text-[12px]">
                Tempat sampah sedang penuh dan perlu dikosongkan dulu sebelum
                bisa menerima setoran baru.
            </p>

            <div className="flex flex-col w-full gap-2 mt-2">
                <button
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 bg-primary text-white font-poppins-bold text-[13px] px-5 py-3 rounded-xl cursor-pointer"
                >
                    <RotateCcw className="w-4 h-4" />
                    Coba Lagi
                </button>

                <button
                    onClick={onLeave}
                    className="border border-gray-200 py-3 text-gray-600 font-poppins-semibold text-[13px] rounded-xl cursor-pointer"
                >
                    Kembali
                </button>
            </div>
        </div>
    );
}

function Success({ result, points, onLeave }) {
    const style = categoryStyle[result.category] ?? categoryStyle.Lainnya;

    return (
        <div className="flex flex-col items-center w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-linear-to-b from-green-50 to-white p-6 pt-10">
            <span className="bg-white border border-green-100 text-primary font-poppins-semibold text-[11px] px-3 py-1 rounded-full">
                Setoran Berhasil!
            </span>

            <h1 className="font-poppins-bold text-2xl mt-4 text-center">
                Terima Kasih! 🎉
            </h1>

            <p className="font-poppins-medium text-gray-500 text-[12px] text-center mt-1 px-4">
                Sampah berhasil diproses. Eco Point telah ditambahkan.
            </p>

            <div className="relative flex-1 flex items-center justify-center">
                <div
                    className={`w-32 h-32 rounded-full ${style.bg} flex items-center justify-center text-6xl animate-bounce-in`}
                >
                    {style.emoji}
                </div>

                <span className="absolute -right-2 top-6 bg-yellow-400 text-white font-poppins-bold text-[10px] px-2 py-1 rounded-full rotate-12 shadow">
                    BERHASIL!
                </span>
            </div>

            <div className="w-full flex flex-col gap-3">
                <div className={`${style.bg} rounded-xl p-3 flex flex-col gap-2`}>
                    <div className="flex items-center justify-between">
                        <p className="font-poppins-bold text-[13px]">
                            {result.category}
                        </p>

                        <span className="bg-white/70 font-poppins-bold text-[12px] px-3 py-1 rounded-full">
                            +{points} Eco Point
                        </span>
                    </div>

                    <div
                        className={`flex items-center gap-3 font-poppins-medium text-[10px] ${style.text}`}
                    >
                        <span>Keyakinan {result.skor}%</span>
                        <span>Kualitas {result.kualitas}%</span>
                        <span>{result.jumlah} item</span>
                    </div>
                </div>

                <button
                    onClick={() => onLeave("/beranda")}
                    className="bg-linear-to-r from-primary to-green-700 py-3.5 text-white font-poppins-bold text-[14px] rounded-xl cursor-pointer"
                >
                    Selesai
                </button>

                <button
                    onClick={() => onLeave("/scan-history")}
                    className="border border-gray-200 py-3 text-gray-600 font-poppins-semibold text-[13px] rounded-xl cursor-pointer"
                >
                    Lihat Riwayat
                </button>
            </div>
        </div>
    );
}

export default function ScanFlow() {
    const { authUser, loading } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState("camera");
    const [progress, setProgress] = useState(0);
    const [remainingMs, setRemainingMs] = useState(DEPOSIT_TIMEOUT_MS);
    const [result, setResult] = useState(null);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleCapture = async (base64Image) => {
        let progressTimer = null;
        let countdownTimer = null;

        try {
            setProgress(8);
            setRemainingMs(DEPOSIT_TIMEOUT_MS);
            setStep("waiting");

            const waitStartedAt = Date.now();

            countdownTimer = setInterval(() => {
                const elapsed = Date.now() - waitStartedAt;
                setRemainingMs(Math.max(0, DEPOSIT_TIMEOUT_MS - elapsed));
            }, 250);

            progressTimer = setInterval(() => {
                setProgress((prev) => (prev < 55 ? prev + 3 : prev));
            }, 150);

            console.log("[SCAN] Menunggu sampah...");

            const analysisPromise = analyzeTrashImage(base64Image);
            const deposited = await waitForDeposit(DEPOSIT_TIMEOUT_MS);

            if (countdownTimer) {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }

            if (!isMountedRef.current) return;

            console.log("[SCAN] Deposit result:", deposited);

            if (!deposited) {
                if (progressTimer) {
                    clearInterval(progressTimer);
                    progressTimer = null;
                }

                await closeSmartBin();

                setErrorMessage(
                    "Sampah tidak terdeteksi dalam 2 menit. Pastikan sampah benar-benar masuk ke tempat sampah."
                );
                setStep("error");
                return;
            }

            console.log("[SCAN] Sampah terdeteksi");

            if (progressTimer) {
                clearInterval(progressTimer);
            }

            setStep("analyzing");

            progressTimer = setInterval(() => {
                setProgress((prev) => (prev < 92 ? prev + 4 : prev));
            }, 120);

            const analysis = await analysisPromise;

            if (progressTimer) {
                clearInterval(progressTimer);
                progressTimer = null;
            }

            if (!isMountedRef.current) return;

            console.log("[SCAN] AI result:", analysis);

            setProgress(100);

            const points = await logDeposit(authUser.uid, analysis);

            if (!isMountedRef.current) return;

            console.log("[SCAN] Point ditambahkan:", points);

            setResult(analysis);
            setPointsEarned(points);
            setStep("success");
        } catch (err) {
            if (progressTimer) {
                clearInterval(progressTimer);
            }
            if (countdownTimer) {
                clearInterval(countdownTimer);
            }

            console.error("[SCAN] ERROR:", err);

            try {
                await closeSmartBin();
            } catch (closeError) {
                console.error("[SCAN] Close bin error:", closeError);
            }

            if (!isMountedRef.current) return;

            setErrorMessage(
                err?.message || "Terjadi kesalahan saat memproses setoran."
            );
            setStep("error");
        }
    };

    const handleRetry = async () => {
        try {
            await closeSmartBin();
        } catch (error) {
            console.error("Close bin error:", error);
        }

        setErrorMessage("");
        setProgress(0);
        setRemainingMs(DEPOSIT_TIMEOUT_MS);
        setResult(null);
        setPointsEarned(0);
        setStep("camera");
    };

    const handleLeaveSuccess = async (path) => {
        try {
            await closeSmartBin();
        } catch (error) {
            console.error("Close bin error:", error);
        }

        navigate(path);
    };

    if (loading || !authUser) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-screen overflow-hidden">
            {step === "camera" && (
                <CameraCapture
                    onCapture={handleCapture}
                    onFull={() => setStep("full")}
                />
            )}

            {step === "waiting" && (
                <WaitingDeposit remainingMs={remainingMs} />
            )}

            {step === "analyzing" && <Analyzing progress={progress} />}

            {step === "error" && (
                <ErrorScreen message={errorMessage} onRetry={handleRetry} />
            )}

            {step === "full" && (
                <FullBin
                    onRetry={handleRetry}
                    onLeave={() => navigate("/beranda")}
                />
            )}

            {step === "success" && result && (
                <Success
                    result={result}
                    points={pointsEarned}
                    onLeave={handleLeaveSuccess}
                />
            )}
        </div>
    );
}