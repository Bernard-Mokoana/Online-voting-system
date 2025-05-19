import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get("role");
    if (role) {
      setSelectedRole(role);
    } else {
      navigate("/role-selection");
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (selectedRole === "admin") {
        await login(formData.usernameOrEmail, formData.password, "admin");
        navigate("/admin-dashboard");
      } else {
        await login(formData.usernameOrEmail, formData.password, "voter");
        navigate("/voter-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate(`/register?role=${selectedRole}`);
  };

  const handleRoleChange = () => {
    navigate("/role-selection");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Login as{" "}
            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={selectedRole === "admin" ? "Username" : "Email"}
              name="usernameOrEmail"
              type={selectedRole === "admin" ? "text" : "email"}
              value={formData.usernameOrEmail}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : "Login"}
            </Button>
          </form>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Divider>
              <Typography color="text.secondary" variant="body2">
                OR
              </Typography>
            </Divider>
          </Box>

          {selectedRole === "voter" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={handleRegister}
              >
                Create New Voter Account
              </Button>
              <Button color="primary" onClick={handleRoleChange}>
                Change Role
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
