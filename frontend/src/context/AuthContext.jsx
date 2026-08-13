import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (decoded.exp) {
      return Date.now() >= decoded.exp * 1000;
    }
    return false;
  } catch (e) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = sessionStorage.getItem("erp_token");
    if (savedToken && !isTokenExpired(savedToken)) {
      return savedToken;
    }
    sessionStorage.removeItem("erp_token");
    sessionStorage.removeItem("erp_user");
    return null;
  });

  const [user, setUser] = useState(() => {
    const savedToken = sessionStorage.getItem("erp_token");
    if (!savedToken || isTokenExpired(savedToken)) {
      return null;
    }
    const saved = sessionStorage.getItem("erp_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(token && user);
  const role = user?.role || "STUDENT";

  useEffect(() => {
    // 1. API logout events
    const handleAutoLogout = () => {
      logout();
    };
    window.addEventListener("auth:logout", handleAutoLogout);

    // 2. Periodic token validity check (every 30 seconds)
    const tokenCheckInterval = setInterval(() => {
      const currentToken = sessionStorage.getItem("erp_token");
      if (currentToken && isTokenExpired(currentToken)) {
        console.log("[Auth] Token expired, logging out...");
        logout();
      }
    }, 30000);

    // 3. Inactivity logout (15 minutes of inactivity)
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
    let inactivityTimer = null;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);

      const currentToken = sessionStorage.getItem("erp_token");
      if (currentToken) {
        inactivityTimer = setTimeout(() => {
          console.log("[Auth] User inactive, logging out...");
          logout();
          alert("Your session has expired due to inactivity. Please log in again.");
        }, INACTIVITY_TIMEOUT);
      }
    };

    const activityEvents = ["mousemove", "keypress", "mousedown", "scroll", "click", "touchstart"];
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      window.removeEventListener("auth:logout", handleAutoLogout);
      clearInterval(tokenCheckInterval);
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [token]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    sessionStorage.setItem("erp_token", newToken);
    sessionStorage.setItem("erp_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("erp_token");
    sessionStorage.removeItem("erp_user");
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
