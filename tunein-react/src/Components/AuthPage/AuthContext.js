import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    setIsAuthenticated(!!token && !!userId);
    setLoading(false);
  }, []);

  const login = (token, userId) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", userId);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Call backend to destroy the session (important for Google OAuth)
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          },
          withCredentials: true // Important for session cookies
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with frontend logout even if backend fails
    } finally {
      // Always clear frontend state
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}