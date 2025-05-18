import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ElectionList from "../components/ElectionList";
import AdminDashboard from "../components/AdminDashboard";
import VoterDashboard from "../components/VoterDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {user?.firstName}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Role: {user?.role}
            </Typography>
          </Paper>
        </Grid>

        {/* Role-specific content */}
        {user?.role === "admin" ? <AdminDashboard /> : <VoterDashboard />}

        {/* Common content */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Active Elections
            </Typography>
            <ElectionList />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
