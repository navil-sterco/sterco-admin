import { useLocation } from "react-router-dom";
import Layout from "./layouts/Layout";
import { Blank } from "./layouts/Blank";
import AppRoutes from "./router/AppRoutes";
import { useAuth } from "./context/AuthContext";

function App() {
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();
    const isAuthPath = location.pathname.startsWith("/login") || location.pathname.startsWith("/auth");

    // Only show the dashboard chrome (sidebar/navbar) once we actually know
    // the user is authenticated. Otherwise, relying on the URL alone means
    // Layout renders for a frame on "/" before ProtectedRoute redirects back
    // to /login, causing the dashboard-then-login flicker.
    const Wrapper = isAuthPath || isLoading || !isAuthenticated ? Blank : Layout;

    return (
        <Wrapper>
            <AppRoutes />
        </Wrapper>
    );
}

export default App;