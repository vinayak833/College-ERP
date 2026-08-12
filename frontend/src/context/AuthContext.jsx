import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("erp_token") || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("erp_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(token && user);
  const role = user?.role || "STUDENT";

  useEffect(() => {
    const handleAutoLogout = () => {
      logout();
    };
    window.addEventListener("auth:logout", handleAutoLogout);
    return () => window.removeEventListener("auth:logout", handleAutoLogout);
  }, []);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("erp_token", newToken);
    localStorage.setItem("erp_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
  };

  return (
    <AuthContext.Provider value={{ token, user, role, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
