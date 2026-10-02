import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { ref as dbRef, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../lib/firebase";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function EditProfile() {
    const navigate = useNavigate();
    const { user, authUser } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [className, setClassName] = useState(user?.className || "");
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const previewUrlRef = useRef("");

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        };
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("File harus berupa gambar");
            return;
        }
        if (file.size > MAX_AVATAR_SIZE) {
            setError("Ukuran gambar maksimal 5MB");
            return;
        }

        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;

        setError("");
        setAvatarFile(file);
        setPreviewUrl(url);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Nama tidak boleh kosong");
            return;
        }
        setError("");
        setSaving(true);
        try {
            let finalAvatarUrl = user?.avatarUrl || "";

            if (avatarFile) {
                setUploadingAvatar(true);
                const fileRef = storageRef(storage, `avatars/${authUser.uid}`);
                await uploadBytes(fileRef, avatarFile);
                finalAvatarUrl = await getDownloadURL(fileRef);
                setUploadingAvatar(false);
            }

            await update(dbRef(db, `users/${authUser.uid}`), {
                name: name.trim(),
                className: className.trim(),
                avatarUrl: finalAvatarUrl,
            });

            navigate(-1);
        } catch (err) {
            setUploadingAvatar(false);
            setError(avatarFile ? "Gagal mengunggah foto, coba lagi" : "Gagal menyimpan perubahan, coba lagi");
        } finally {
            setSaving(false);
        }
    };

    const displayAvatar = previewUrl || user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=00BF2A&color=fff&bold=true&size=128`;
    const busy = saving || uploadingAvatar;

    return (
        <div className="relative w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-gray-50 flex flex-col">
            <div className="bg-linear-to-br from-primary to-[#009923] pt-5 pb-6 px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
                        <ArrowLeft className="w-4.5 h-4.5 text-white" />
                    </button>
                    <div className="flex flex-col">
                        <p className="font-poppins-bold text-white text-[16px]">Ubah Data Akun</p>
                        <p className="font-poppins-medium text-white/80 text-[11px]">Ubah detail diri Anda</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 -mt-3 pb-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center mb-4">
                    <div className="relative w-24 h-24 mb-2 group">
                        <img
                            src={displayAvatar}
                            alt={name}
                            className={`w-full h-full rounded-full object-cover border-4 border-gray-100 transition-opacity ${uploadingAvatar ? "opacity-50" : ""}`}
                        />
                        {uploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        <label className={`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md transition-transform ${busy ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}>
                            <Camera className="w-4 h-4 text-white" />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={busy} className="hidden" />
                        </label>
                    </div>
                    <p className="font-poppins-medium text-gray-400 text-[10.5px] text-center">
                        {uploadingAvatar ? "Mengunggah foto..." : "Ketuk ikon kamera untuk ganti foto"}
                    </p>
                </div>

                {error && <p className="font-poppins-medium text-red-500 text-[12px] mb-3">{error}</p>}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-gray-700 text-[13px]">Nama Lengkap</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Masukkan nama Anda"
                            className="border border-gray-300 rounded-lg px-4 py-3 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-gray-700 text-[13px]">Kelas</label>
                        <input
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            placeholder="Contoh: XI SIJA 1"
                            className="border border-gray-300 rounded-lg px-4 py-3 text-[13px] font-poppins-medium placeholder:text-gray-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-poppins-semibold text-gray-700 text-[13px]">Email</label>
                        <input
                            value={authUser?.email || ""}
                            disabled
                            className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-[13px] font-poppins-medium text-gray-400 outline-none cursor-not-allowed"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={busy}
                    className="w-full bg-linear-to-r from-primary to-[#009923] text-white font-poppins-bold text-[14px] py-3.5 rounded-xl cursor-pointer active:scale-95 transition-transform mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {uploadingAvatar ? "Mengunggah foto..." : saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </div>
    );
}