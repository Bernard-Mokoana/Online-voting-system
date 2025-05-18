import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Grid,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

// Test data
const initialCandidates = [
  { id: 1, name: "John Doe", votes: 150 },
  { id: 2, name: "Jane Smith", votes: 120 },
  { id: 3, name: "Bob Johnson", votes: 80 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [newCandidate, setNewCandidate] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/dashboard");
      setStats(response.data);
    } catch {
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = () => {
    if (newCandidate.trim()) {
      const newId = Math.max(...candidates.map((c) => c.id)) + 1;
      setCandidates([
        ...candidates,
        { id: newId, name: newCandidate, votes: 0 },
      ]);
      setNewCandidate("");
      setMessage("Candidate added successfully!");
      setAlertType("success");
    }
  };

  const handleDeleteCandidate = (id) => {
    setCandidates(candidates.filter((c) => c.id !== id));
    setMessage("Candidate deleted successfully!");
    setAlertType("success");
  };

  const handleRefreshResults = () => {
    // Simulate refreshing results
    setMessage("Results refreshed!");
    setAlertType("info");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {message && (
        <Alert severity={alertType} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Manage Candidates" />
        <Tab label="View Results" />
      </Tabs>

      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Candidate
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              label="Candidate Name"
              value={newCandidate}
              onChange={(e) => setNewCandidate(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCandidate}
              disabled={!newCandidate.trim()}
            >
              Add
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            Current Candidates
          </Typography>
          <List>
            {candidates.map((candidate) => (
              <ListItem key={candidate.id}>
                <ListItemText primary={candidate.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteCandidate(candidate.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6">Election Results</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshResults}
            >
              Refresh
            </Button>
          </Box>

          <Grid container spacing={2}>
            {candidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                  }}
                >
                  <Typography variant="h6">{candidate.name}</Typography>
                  <Typography variant="h4">{candidate.votes}</Typography>
                  <Typography variant="body2">votes</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Total Voters
            </Typography>
            <Typography variant="h4">{stats?.totalVoters || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Total Candidates
            </Typography>
            <Typography variant="h4">{stats?.totalCandidates || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Total Votes
            </Typography>
            <Typography variant="h4">{stats?.totalVotes || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Active Elections
            </Typography>
            <Typography variant="h4">{stats?.activeElections || 0}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/elections/create")}
              >
                Create Election
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/users")}
              >
                Manage Users
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => navigate("/candidates")}
              >
                Manage Candidates
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
