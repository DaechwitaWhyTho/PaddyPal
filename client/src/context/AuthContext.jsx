import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser, fetchMe, logoutUser } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "onnoprohori_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    setAuthError("");
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.user);
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || "Could not log in. Try again.");
      return false;
    }
  };

  const register = async (data) => {
    setAuthError("");
    try {
      const res = await registerUser(data);
      localStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.user);
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || "Could not create your account.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // client-side logout should still succeed even if this call fails
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
