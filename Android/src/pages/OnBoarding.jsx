import { useEffect, useState } from "react";
import logo from "/logo/logo.png";
import onboarding1 from "/image/onboarding/onboarding1.png";
import onboarding2 from "/image/onboarding/onboarding2.png";
import onboarding3 from "/image/onboarding/onboarding3.png";
import onboarding1bg from "/image/onboarding/onboarding1-bg.png";
import onboarding2bg from "/image/onboarding/onboarding2-bg.png";
import onboarding3bg from "/image/onboarding/onboarding3-bg.png";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Splash({ setCurrentPage }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const fadeOut = setTimeout(() => setVisible(false), 1200);
        const nextPage = setTimeout(() => setCurrentPage("onboarding1"), 2000);
        return () => {
            clearTimeout(fadeOut);
            clearTimeout(nextPage);
        };
    }, []);

    return (
        <div className="w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-white flex items-center justify-center">
            <img
                src={logo}
                alt="logo"
                className={`w-28 h-auto transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    );
}

function OnBoarding1({ setCurrentPage }) {
    return (
        <div
            className="flex flex-col justify-between w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-cover bg-center bg-no-repeat p-4"
            style={{ backgroundImage: `url(${onboarding1bg})` }}
        >
            <div className="flex flex-col gap-3 mt-8 relative shrink-0">
                <p
                    onClick={() => setCurrentPage("onboarding2")}
                    className="absolute right-1 -top-4 font-poppins-medium text-[12px] underline text-primary cursor-pointer"
                >
                    Selanjutnya
                </p>
                <h1 className="font-poppins-bold text-3xl leading-tight">
                    <span className="text-primary">Pilah Sampah</span>
                    <br /> Jadi Lebih Seru!
                </h1>
                <p className="font-poppins-medium text-justify text-gray-500 text-[12px]">
                    Ubah kebiasaan membuang sampah menjadi aktivitas yang menyenangkan. Kumpulkan Eco Point setiap kali kamu menyetor sampah.
                </p>
                <button
                    onClick={() => setCurrentPage("onboarding2")}
                    className="bg-black w-fit py-3 px-4 text-white font-poppins-bold text-[14px] rounded-xl cursor-pointer"
                >
                    Mulai Sekarang
                </button>
            </div>

            <div className="flex-1 flex items-end justify-center min-h-0">
                <img src={onboarding1} alt="onboarding1" className="w-80 h-auto max-h-full object-contain" />
            </div>
        </div>
    );
}

function OnBoarding2({ setCurrentPage }) {
    return (
        <div
            className="flex flex-col justify-between w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-cover bg-center bg-no-repeat pt-4 px-4"
            style={{ backgroundImage: `url(${onboarding2bg})` }}
        >
            <div className="flex flex-col gap-2 mt-8 relative shrink-0">
                <p
                    onClick={() => setCurrentPage("onboarding3")}
                    className="absolute right-1 -top-4 font-poppins-medium text-[12px] underline text-secondary cursor-pointer"
                >
                    Selanjutnya
                </p>
                <h1 className="font-poppins-bold text-3xl leading-tight">
                    Setiap <span className="text-secondary">Sampah</span>
                    <br />
                    Punya Nilai
                </h1>
                <p className="font-poppins-medium text-justify text-gray-500 text-[10px]">
                    Ubah kebiasaan membuang sampah menjadi aktivitas yang menyenangkan. Kumpulkan Eco Point setiap kali kamu menyetor sampah.
                </p>

                <div className="flex flex-col gap-2 mt-1">
                    <div className="w-[75%] ml-auto bg-primary/80 border-primary/60 border-4 rounded-md flex justify-between items-center py-2 px-3">
                        <div className="flex flex-col gap-0.5">
                            <h1 className="font-poppins-bold text-[13px]">Kenali Jenis Sampah</h1>
                            <p className="font-poppins-medium text-black text-[11px]">Foto & Analisis AI.</p>
                        </div>
                        <ArrowRight className="text-white bg-black rounded-full p-2 w-7 h-7 -rotate-45 shrink-0" />
                    </div>

                    <div className="w-[75%] bg-secondary/80 border-secondary/60 border-4 rounded-md flex justify-between items-center py-2 px-3">
                        <div className="flex flex-col gap-0.5">
                            <h1 className="font-poppins-bold text-[13px]">Setor Sampah Pintar</h1>
                            <p className="font-poppins-medium text-black text-[11px]">Scan QR & Buang Sampah.</p>
                        </div>
                        <ArrowRight className="text-white bg-black rounded-full p-2 w-7 h-7 -rotate-45 shrink-0" />
                    </div>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                    <h1 className="font-poppins-semibold text-[16px]">Analisis AI</h1>
                    <p className="font-poppins-medium text-justify text-gray-500 text-[10px] line-clamp-3">
                        Ambil foto sampahmu dan biarkan AI mengenali jenisnya secara otomatis. Setelah berhasil dianalisis, Smart Bin akan terbuka sehingga kamu dapat membuang sampah tersebut.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-end justify-start min-h-0">
                <img src={onboarding2} alt="onboarding2" className="w-56 relative -left-12 h-auto max-h-full object-contain" />
            </div>
        </div>
    );
}

function OnBoarding3() {
    const navigate = useNavigate();

    return (
        <div
            className="flex flex-col justify-between w-full h-screen max-w-107.5 mx-auto overflow-hidden bg-cover bg-center bg-no-repeat pt-4 px-4"
            style={{ backgroundImage: `url(${onboarding3bg})` }}
        >
            <div className="flex flex-col gap-2 mt-8 relative shrink-0">
                <h1 className="font-poppins-bold text-3xl leading-tight">
                    Kumpulkan <span className="text-primary">Poin</span>
                    <br />& Raih <span className="text-primary">Hadiahnya</span>
                </h1>
                <p className="font-poppins-medium text-justify text-gray-500 text-[10px]">
                    Ubah kebiasaan membuang sampah menjadi aktivitas yang menyenangkan. Kumpulkan Eco Point setiap kali kamu menyetor sampah.
                </p>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0">
                <img src={onboarding3} alt="onboarding3" className="w-44 h-auto max-h-full object-contain" />
            </div>

            <div className="bg-white p-4 rounded-lg w-full mb-4 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h1 className="font-poppins-bold text-[22px]">15</h1>
                    <p className="font-poppins-medium text-[12px]">Poin Hadiah</p>
                </div>
                <button
                    onClick={() => navigate("/masuk")}
                    className="bg-black py-3 px-4 text-white font-poppins-bold text-[13px] rounded-xl cursor-pointer"
                >
                    Mulai Sekarang
                </button>
            </div>
        </div>
    );
}

export default function OnBoarding() {
    const [currentPage, setCurrentPage] = useState("splash");

    return (
        <div className="w-full h-screen overflow-hidden">
            {currentPage === "splash" && <Splash setCurrentPage={setCurrentPage} />}
            {currentPage === "onboarding1" && <OnBoarding1 setCurrentPage={setCurrentPage} />}
            {currentPage === "onboarding2" && <OnBoarding2 setCurrentPage={setCurrentPage} />}
            {currentPage === "onboarding3" && <OnBoarding3 />}
        </div>
    );
}