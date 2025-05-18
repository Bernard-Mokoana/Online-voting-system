import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import Register from "./Register";
import api, { endpoints } from "../api/axios";

const LoginRegister = ({ role, onLogin }) => {
  const [view, setView] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);

  const register = async () => {
    setIsLoading(true);
    try {
      await api.post(endpoints.auth.register, { username, password, role });
      setMessage("Registered! Please login.");
      setAlertType("success");
      setView("login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
      setAlertType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(endpoints.auth.login, {
        username,
        password,
      });
      const { token, role: userRole } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      onLogin(token, userRole);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setAlertType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (role === "voter" && view === "register") {
    return <Register onViewChange={setView} />;
  }

  return (
    <Paper
      elevation={6}
      sx={{ p: 4, borderRadius: 3, maxWidth: 400, mx: "auto", mt: 6 }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        {view === "login" ? `Login as ${role}` : `Register as ${role}`}
      </Typography>
      {message && (
        <Alert severity={alertType} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          autoFocus
          disabled={isLoading}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          disabled={isLoading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={view === "login" ? login : register}
          fullWidth
          disabled={isLoading}
        >
          {isLoading
            ? "Please wait..."
            : view === "login"
            ? "Login"
            : "Register"}
        </Button>
        <Button
          color="secondary"
          onClick={() => setView(view === "login" ? "register" : "login")}
          fullWidth
          disabled={isLoading}
        >
          {view === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Button>
      </Box>
    </Paper>
  );
};

export default LoginRegister;
