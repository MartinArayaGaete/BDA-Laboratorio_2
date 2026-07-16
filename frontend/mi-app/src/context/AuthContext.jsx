import React, { createContext, useState, useEffect } from "react";
import authService from "../api/authService.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recuperar sesión persistente
    const savedUser = localStorage.getItem("usuarioLogueado");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (rut, password) => {
    const userData = await authService.login(rut, password);
    setUser(userData);
    localStorage.setItem("usuarioLogueado", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("usuarioLogueado");
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
