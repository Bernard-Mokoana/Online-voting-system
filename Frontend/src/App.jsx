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
      main: "#1a3a6b",       // deep navy — trustworthy, government-official
      light: "#2d5299",
      dark: "#0f2244",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#b71c1c",       // solid red — civic authority, no shimmer
      light: "#d32f2f",
      dark: "#7f0000",
      contrastText: "#ffffff",
    },
    success: {
      main: "#2e7d32",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#555555",
    },
    divider: "#cccccc",
  },
  typography: {
    fontFamily: '"Segoe UI", Arial, "Helvetica Neue", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 4,         // flat, not bubbly
  },
  shadows: [
    "none",
    "0 1px 2px rgba(0,0,0,0.12)",
    "0 1px 4px rgba(0,0,0,0.14)",
    "0 2px 6px rgba(0,0,0,0.15)",
    "0 2px 8px rgba(0,0,0,0.16)",
    ...Array(20).fill("0 2px 8px rgba(0,0,0,0.16)"),
  ],
  transitions: {
    duration: {
      shortest: 80,
      shorter: 100,
      short: 120,
      standard: 150,
      complex: 180,
      enteringScreen: 150,
      leavingScreen: 100,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          "&:active": { boxShadow: "none" },
        },
        containedPrimary: {
          background: "#1a3a6b",
          "&:hover": { background: "#2d5299" },
        },
        containedSecondary: {
          background: "#b71c1c",
          "&:hover": { background: "#d32f2f" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",   // MUI v5 adds gradient — kill it
        },
        elevation3: {
          boxShadow: "0 1px 4px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            background: "#fff",
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            background: "#1a3a6b",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.8125rem",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { background: "#eef2f7" },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 3 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 3, border: "1px solid" } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 2, height: 8 },
        bar: { borderRadius: 2 },
      },
    },
    MuiCircularProgress: {
      defaultProps: { size: 32, thickness: 4 },
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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f0f2f5",
          gap: 1.5,
        }}
      >
        <CircularProgress sx={{ color: "#1a3a6b" }} />
        <Box component="span" sx={{ fontSize: "0.8rem", color: "#999" }}>
          Loading…
        </Box>
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
