import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CircularProgress, CssBaseline, Box } from "@mui/material";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";

// Pages

import VoterLogin from "./pages/VoterLogin";
import CandidateLogin from "./pages/CandidateLogin";
import AdminLogin from "./pages/AdminLogin";
import VoterRegister from "./pages/VoterRegister";
import CandidateRegister from "./pages/CandidateRegister";
import VoterDashboard from "./components/VoterDashboard";
import AdminDashboard from "./components/AdminDashboard";
import CandidateDashboard from "./components/CandidateDashboard";
import RoleSelection from "./pages/RoleSelection";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin-dashboard"
                  : user.role === "candidate"
                  ? "/candidate-dashboard"
                  : "/voter-dashboard"
              }
            />
          ) : (
            <RoleSelection />
          )
        }
      />
      <Route path="/login" element={<VoterLogin />} />
      <Route path="/candidate-login" element={<CandidateLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/register" element={<VoterRegister />} />
      <Route path="/candidate-register" element={<CandidateRegister />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route
        path="/voter-dashboard"
        element={
          <ProtectedRoute>
            <VoterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate-dashboard"
        element={
          <ProtectedRoute>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
