import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import HowToVoteOutlinedIcon from "@mui/icons-material/HowToVoteOutlined";
import { useAuth } from "../hooks/useAuth.js";

const VoterLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email, formData.password, "voter");
      // FIX #17: navigate based on the user role set in AuthContext after login
      // (candidates accidentally using the voter login form get routed correctly)
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      if (stored.role === "candidate") {
        navigate("/candidate-dashboard");
      } else {
        navigate("/voter-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderTop: "4px solid #2e7d32",
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
          <HowToVoteOutlinedIcon sx={{ color: "#2e7d32", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Voter Sign In
            </Typography>
            <Typography variant="caption" sx={{ color: "#777" }}>
              Online Voting System
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Email address
          </Typography>
          <TextField
            fullWidth
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ background: "#2e7d32", "&:hover": { background: "#1b5e20" }, py: 1 }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Sign In"}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ color: "#555" }}>
            No account?{" "}
            <Link to="/register" style={{ color: "#1a3a6b", fontWeight: 600 }}>
              Register
            </Link>
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Link to="/admin-login" style={{ fontSize: "0.75rem", color: "#777" }}>
              Admin
            </Link>
            <Link to="/candidate-login" style={{ fontSize: "0.75rem", color: "#777" }}>
              Candidate
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default VoterLogin;
