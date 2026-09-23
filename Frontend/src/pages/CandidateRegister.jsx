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
  Grid,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api/axios";

const Field = ({ label, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

const CandidateRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    idNumber: "",
    position: "",
    biography: "",
    password: "",
    confirmPassword: "",
    electionId: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    data.append("idNumber", formData.idNumber);
    data.append("position", formData.position);
    data.append("biography", formData.biography);
    data.append("password", formData.password);
    data.append("electionId", formData.electionId);
    if (image) data.append("image", image);

    try {
      await api.post("/candidates/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/candidate-login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: "#f0f2f5", minHeight: "100vh", py: 5, px: 2 }}>
      <Paper
        variant="outlined"
        sx={{ maxWidth: 560, mx: "auto", p: { xs: 3, sm: 4 }, borderTop: "4px solid #b71c1c", borderRadius: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
          <PersonIcon sx={{ color: "#b71c1c", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Candidate Registration
            </Typography>
            <Typography variant="caption" sx={{ color: "#777" }}>
              Create your candidate profile
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Field label="First Name">
                <TextField fullWidth name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First name" />
              </Field>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field label="Last Name">
                <TextField fullWidth name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Last name" />
              </Field>
            </Grid>
          </Grid>

          <Field label="Email address">
            <TextField fullWidth name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
          </Field>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Field label="ID Number">
                <TextField fullWidth name="idNumber" value={formData.idNumber} onChange={handleChange} required placeholder="National ID" />
              </Field>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field label="Election ID">
                <TextField fullWidth name="electionId" value={formData.electionId} onChange={handleChange} required placeholder="e.g. 1" />
              </Field>
            </Grid>
          </Grid>

          <Field label="Running Position">
            <TextField fullWidth name="position" value={formData.position} onChange={handleChange} required placeholder="e.g. President" />
          </Field>

          <Field label="Biography">
            <TextField
              fullWidth
              name="biography"
              value={formData.biography}
              onChange={handleChange}
              required
              multiline
              rows={3}
              placeholder="Tell voters about yourself..."
            />
          </Field>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Field label="Password">
                <TextField fullWidth name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
              </Field>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field label="Confirm Password">
                <TextField fullWidth name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" />
              </Field>
            </Grid>
          </Grid>

          <Field label="Candidate Photo (optional)">
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                px: 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                background: "#fafafa",
              }}
            >
              <Button variant="outlined" component="label" size="small" sx={{ whiteSpace: "nowrap", minWidth: 120 }}>
                Choose file
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              <Typography variant="body2" sx={{ color: "#777", fontSize: "0.8rem" }}>
                {image ? image.name : "No file chosen"}
              </Typography>
            </Box>
          </Field>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 1, background: "#b71c1c", "&:hover": { background: "#7f0000" }, py: 1 }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Create Account"}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }} />
        <Typography variant="body2" sx={{ color: "#555", textAlign: "center" }}>
          Already registered?{" "}
          <Link to="/candidate-login" style={{ color: "#1a3a6b", fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default CandidateRegister;
