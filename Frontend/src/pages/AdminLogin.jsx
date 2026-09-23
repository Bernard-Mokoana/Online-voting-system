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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAuth } from "../hooks/useAuth.js";

const AdminLogin = () => {
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
      await login(formData.email, formData.password, "admin");
      navigate("/admin-dashboard");
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
          borderTop: "4px solid #1a3a6b",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
          <AdminPanelSettingsIcon sx={{ color: "#1a3a6b", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Administrator Sign In
            </Typography>
            <Typography variant="caption" sx={{ color: "#777" }}>
              Restricted access
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
            placeholder="admin@example.com"
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
            sx={{ py: 1 }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Sign In"}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Link to="/login" style={{ fontSize: "0.8rem", color: "#777" }}>
            Voter login
          </Link>
          <Link to="/candidate-login" style={{ fontSize: "0.8rem", color: "#777" }}>
            Candidate login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
