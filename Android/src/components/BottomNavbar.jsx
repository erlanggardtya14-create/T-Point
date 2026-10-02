import { Home, Gift, BarChart2, User, ScanLine } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
    { label: "Beranda", path: "/beranda", icon: Home },
    { label: "Hadiah", path: "/reward", icon: Gift },
    { label: "Peringkat", path: "/leaderboard", icon: BarChart2 },
    { label: "Akun", path: "/profile", icon: User },
];

export default function BottomNavbar() {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-100 bg-white rounded-2xl shadow-lg flex items-center justify-between px-2 py-2">
            {navItems.slice(0, 2).map(({ label, path, icon: Icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 px-3 py-1 rounded-xl ${isActive ? "text-primary" : "text-gray-400"}`
                    }
                >
                    <Icon className="w-5 h-5" />
                    <span className="font-poppins-semibold text-[10px]">{label}</span>
                </NavLink>
            ))}

            <button
                onClick={() => navigate("/scan")}
                className="bg-primary rounded-full w-12 h-12 flex items-center justify-center -mt-8 shadow-md shrink-0"
            >
                <ScanLine className="w-5 h-5 text-white" />
            </button>

            {navItems.slice(2).map(({ label, path, icon: Icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 px-3 py-1 rounded-xl ${isActive ? "text-primary" : "text-gray-400"}`
                    }
                >
                    <Icon className="w-5 h-5" />
                    <span className="font-poppins-semibold text-[10px]">{label}</span>
                </NavLink>
            ))}
        </div>
    );
}