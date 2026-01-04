import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post("/auth/login", {
      email,
      password,
    });
    const { accessToken, user } = response.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    return user;
  };

  const adminLogin = async (username, password) => {
    const response = await axios.post("/admin/login", {
      username,
      password,
    });
    const { token, admin } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(admin));
    setUser(admin);

    return admin;
  };

  const register = async (userData) => {
    const response = await axios.post("/voters/register", userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
