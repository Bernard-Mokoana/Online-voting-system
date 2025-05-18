import axios from "axios";

// Create axios instance with default config
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: "/login",
    register: "/register",
    logout: "/logout",
    refreshToken: "/auth/refresh-token",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
  },

  // User endpoints
  users: {
    profile: "/users/profile",
    update: "/users/update",
    changePassword: "/users/change-password",
    updateProfile: "/users/update-profile",
    deleteAccount: "/users/delete-account",
    list: "/users",
    getById: (id) => `/users/${id}`,
    search: "/users/search",
    verifyId: "/users/verify-id",
  },

  // Candidate endpoints
  candidates: {
    list: "/candidates",
    create: "/candidates",
    update: (id) => `/candidates/${id}`,
    delete: (id) => `/candidates/${id}`,
    getById: (id) => `/candidates/${id}`,
    search: "/candidates/search",
    uploadImage: (id) => `/candidates/${id}/image`,
    updateStatus: (id) => `/candidates/${id}/status`,
    getStats: "/candidates/stats",
  },

  // Vote endpoints
  votes: {
    cast: "/votes",
    results: "/votes/results",
    verify: "/votes/verify",
    history: "/votes/history",
    getByUser: "/votes/user",
    getByElection: (electionId) => `/votes/election/${electionId}`,
    getStats: "/votes/stats",
  },

  // Election endpoints
  elections: {
    list: "/elections",
    create: "/elections",
    update: (id) => `/elections/${id}`,
    delete: (id) => `/elections/${id}`,
    getById: (id) => `/elections/${id}`,
    getActive: "/elections/active",
    getUpcoming: "/elections/upcoming",
    getPast: "/elections/past",
    updateStatus: (id) => `/elections/${id}/status`,
    getStats: "/elections/stats",
  },

  // Admin endpoints
  admin: {
    dashboard: "/admin/dashboard",
    users: {
      list: "/admin/users",
      create: "/admin/users",
      update: (id) => `/admin/users/${id}`,
      delete: (id) => `/admin/users/${id}`,
      getStats: "/admin/users/stats",
    },
    elections: {
      list: "/admin/elections",
      create: "/admin/elections",
      update: (id) => `/admin/elections/${id}`,
      delete: (id) => `/admin/elections/${id}`,
      getStats: "/admin/elections/stats",
    },
    candidates: {
      list: "/admin/candidates",
      create: "/admin/candidates",
      update: (id) => `/admin/candidates/${id}`,
      delete: (id) => `/admin/candidates/${id}`,
      getStats: "/admin/candidates/stats",
    },
    votes: {
      list: "/admin/votes",
      getStats: "/admin/votes/stats",
      export: "/admin/votes/export",
    },
    reports: {
      generate: "/admin/reports/generate",
      list: "/admin/reports",
      download: (id) => `/admin/reports/${id}/download`,
    },
  },

  // System endpoints
  system: {
    health: "/system/health",
    logs: "/system/logs",
    settings: "/system/settings",
    backup: "/system/backup",
    restore: "/system/restore",
  },
};

export default instance;
