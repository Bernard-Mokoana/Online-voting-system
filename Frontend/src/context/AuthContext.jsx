import { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext(null);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role = "voter") => {
    let url = "/auth/login";
    if (role === "admin") {
      url = "/admin/login";
    }
    const response = await axios.post(
      url,
      JSON.stringify({ email, password }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    const { user: userData, accessToken } = response.data.data;
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const register = async (
    firstName,
    lastName,
    email,
    idNumber,
    dateOfBirth,   // FIX #18: was "dataOfBirth" (typo)
    phoneNumber,
    password,
    profileImage
  ) => {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("idNumber", idNumber);
    formData.append("dateOfBirth", dateOfBirth);  // FIX #18: was "dataOfBirth"
    formData.append("phoneNumber", phoneNumber);
    formData.append("password", password);
    if (profileImage) {
      formData.append("avatar", profileImage);
    }

    const response = await axios.post("/voters/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, register, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};


