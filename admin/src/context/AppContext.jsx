// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("ekart_admin_token") || ""
  );
  const [toasts, setToasts] = useState([]);

  const saveToken = useCallback((t) => {
    setToken(t);
    if (t) localStorage.setItem("ekart_admin_token", t);
    else localStorage.removeItem("ekart_admin_token");
  }, []);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <AppContext.Provider value={{ token, setToken: saveToken, toast, toasts }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);