import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
  Paper,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";
import axios from "../api/axios";

const Field = ({ label, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // FIX #13: Was a stub — now actually calls the backend API
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      if (formData.newPassword && formData.currentPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      await axios.put("/voters/profile", payload);
      setSuccess("Profile updated successfully.");
      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccountCircleIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 24 }} />
            <Box>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                My Profile
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)", mt: 0.25 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Container maxWidth="sm" sx={{ py: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#1a3a6b" }}>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field label="First Name">
                    <TextField fullWidth name="firstName" value={formData.firstName} onChange={handleChange} required />
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Last Name">
                    <TextField fullWidth name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Field label="Email address">
                    <TextField fullWidth name="email" type="email" value={formData.email} disabled sx={{ "& .MuiOutlinedInput-root": { background: "#f5f5f5" } }} />
                  </Field>
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <LockOutlinedIcon sx={{ fontSize: 16, color: "#777" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a3a6b" }}>
                  Change Password
                </Typography>
              </Box>
              <Field label="Current Password">
                <TextField fullWidth name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} placeholder="Enter current password" />
              </Field>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field label="New Password">
                    <TextField fullWidth name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="New password" />
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Confirm New Password">
                    <TextField fullWidth name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat new password" />
                  </Field>
                </Grid>
              </Grid>
            </Paper>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1 }}
            >
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Profile;
