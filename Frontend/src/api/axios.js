import axios from "axios";

const instance = axios.create({
  // Ensure this matches your backend port and prefix
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Handle 401 by redirecting to login
    // if (error.response?.status === 401) { ... }
    return Promise.reject(error);
  }
);

export default instance;
