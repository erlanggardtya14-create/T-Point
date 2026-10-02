const GEMINI_API_KEY = import.meta.env.VITE_API_GEMINI;
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const VALID_CATEGORIES = [
    "Plastik",
    "Kertas",
    "Kardus",
    "Kaleng",
    "Logam",
    "Kaca",
    "Kain",
    "Karet",
    "Kayu",
    "Elektronik",
    "Tetra Pak",
    "Styrofoam",
    "Lainnya",
];

export async function analyzeTrashImage(base64Image) {
    const prompt = `Kamu adalah sistem klasifikasi sampah untuk tempat sampah pintar daur ulang. Analisis gambar sampah berikut.

Tentukan kategori sampah, HARUS salah satu dari daftar ini: "Plastik", "Kertas", "Kardus", "Kaleng", "Logam", "Kaca", "Kain", "Karet", "Kayu", "Elektronik", "Tetra Pak", "Styrofoam". Jika sampah tidak cocok dengan kategori manapun di atas, gunakan "Lainnya".

Berikan juga:
- skor: keyakinan klasifikasi kategori, 0-100
- kualitas: kondisi kebersihan dan keutuhan sampah (bersih, kering, tidak rusak = tinggi; kotor, basah, rusak/hancur = rendah), 0-100
- jumlah: perkiraan jumlah item sampah yang terlihat pada gambar, angka bulat minimal 1
- points: nilai poin akhir yang pantas diberikan, 1-100, dihitung dengan mempertimbangkan nilai daur ulang kategori sampah (misalnya logam dan elektronik bernilai lebih tinggi daripada plastik atau styrofoam), kualitas/kebersihan sampah, dan jumlah sampah. Semakin bernilai kategorinya, semakin bersih kondisinya, dan semakin banyak jumlahnya, maka points harus semakin besar.

Balas HANYA dengan JSON valid tanpa teks tambahan dan tanpa markdown, format persis seperti ini: {"category": "Plastik", "skor": 87, "kualitas": 80, "jumlah": 2, "points": 24}`;

    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: base64Image } },
                    ],
                },
            ],
            generationConfig: { temperature: 0.2 },
        }),
    });

    if (!response.ok) {
        throw new Error("Gagal menganalisis gambar");
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("Gagal membaca hasil analisis AI, coba ambil foto ulang.");
    }

    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : "Lainnya";

    return {
        category,
        skor: Math.max(0, Math.min(100, Number(parsed.skor) || 0)),
        kualitas: Math.max(0, Math.min(100, Number(parsed.kualitas) || 0)),
        jumlah: Math.max(1, Math.round(Number(parsed.jumlah) || 1)),
        points: Math.max(1, Math.min(100, Math.round(Number(parsed.points) || 0))),
    };
}