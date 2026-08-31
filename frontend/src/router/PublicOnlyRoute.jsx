import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoadingState = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status" aria-label="Loading" />
    </div>
);

export const PublicOnlyRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingState />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};