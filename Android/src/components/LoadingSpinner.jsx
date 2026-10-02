export default function LoadingSpinner({ text = "Memuat..." }) {
    return (
        <div className="w-full h-screen max-w-107.5 mx-auto flex flex-col items-center justify-center gap-4 bg-white">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="font-poppins-semibold text-gray-500 text-[13px]">{text}</p>
        </div>
    );
}