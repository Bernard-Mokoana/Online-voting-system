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
import ElectionDetails from "./pages/ElectionDetails";
import RoleSelection from "./pages/RoleSelection";
import Vote from "./pages/Vote";
import ElectionResults from "./pages/ElectionResults";
import VotingHistory from "./pages/VotingHistory";
import Elections from "./pages/Elections";
import Candidates from "./pages/Candidates";
import Users from "./pages/Users";
import Profile from "./pages/Profile";

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

const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
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
            <RoleRoute roles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate-dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["candidate"]}>
              <CandidateDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/elections/:electionId"
        element={
          <ProtectedRoute>
            <ElectionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/elections/:electionId/vote"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["voter"]}>
              <Vote />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/elections/:electionId/results"
        element={
          <ProtectedRoute>
            <ElectionResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voting-history"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["voter"]}>
              <VotingHistory />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/elections"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["admin"]}>
              <Elections />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["admin"]}>
              <Candidates />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["admin"]}>
              <Users />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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
