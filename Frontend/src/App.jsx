import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navigation from "./components/Navigation";

// Lazy load pages
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Users = React.lazy(() => import("./pages/Users"));
const Elections = React.lazy(() => import("./pages/Elections"));
const Candidates = React.lazy(() => import("./pages/Candidates"));
const VotingHistory = React.lazy(() => import("./pages/VotingHistory"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const ServerError = React.lazy(() => import("./pages/ServerError"));
const Maintenance = React.lazy(() => import("./pages/Maintenance"));
const Vote = React.lazy(() => import("./pages/Vote"));
const ElectionDetails = React.lazy(() => import("./pages/ElectionDetails"));
const ElectionResults = React.lazy(() => import("./pages/ElectionResults"));
const RoleSelection = React.lazy(() => import("./pages/RoleSelection"));

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
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/role-selection" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <>
      <Navigation />
      <Box sx={{ p: 3 }}>
        <Suspense
          fallback={
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="100vh"
            >
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elections"
              element={
                <ProtectedRoute>
                  <Elections />
                </ProtectedRoute>
              }
            />
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
                  <Vote />
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
              path="/candidates"
              element={
                <ProtectedRoute>
                  <Candidates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voting-history"
              element={
                <ProtectedRoute>
                  <VotingHistory />
                </ProtectedRoute>
              }
            />
            <Route path="/500" element={<ServerError />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/dev-dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/role-selection" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
