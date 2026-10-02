import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

export const AuthProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner text="Memuat Sesi..." />;
    }

    if (!user) {
        return <Navigate to="/masuk" replace />;
    }

    return <Outlet />;
}

export const GuestProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner text="Memuat Sesi..." />;
    }

    if (user) {
        return <Navigate to="/beranda" replace />;
    }

    return <Outlet />;
}
