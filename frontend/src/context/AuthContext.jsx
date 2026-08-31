import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user || res.data);
      } catch (err) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);

    if (token) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken');
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
