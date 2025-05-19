import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Info } from "@mui/icons-material";
import axios from "axios";

const AdminDashboard = () => {
  // Mock data for fallback
  const mockElections = [
    {
      ElectionID: 1,
      ElectionName: "Presidential Election 2025",
      Description: "Vote for the next president.",
      StartDate: "2025-05-01T08:00:00Z",
      EndDate: "2025-05-10T18:00:00Z",
    },
    {
      ElectionID: 2,
      ElectionName: "Local Council Election 2025",
      Description: "Vote for your local council representatives.",
      StartDate: "2025-06-01T08:00:00Z",
      EndDate: "2025-06-05T18:00:00Z",
    },
  ];

  const [elections, setElections] = useState([]);
  const [message, setMessage] = useState({ text: "", severity: "info" });

  useEffect(() => {
    const fetchElections = async () => {
      try {
        // Fetch data from the backend
        const response = await axios.get("/api/elections");
        setElections(response.data);
      } catch (error) {
        console.error("Backend error:", error);
        // Fallback to mock data
        setElections(mockElections);
        setMessage({
          text: "Unable to fetch data from the server. Using fallback data.",
          severity: "warning",
        });
      }
    };

    fetchElections();
  }, []);

  const handleAddElection = () => {
    setMessage({
      text: "Add Election functionality is not implemented yet.",
      severity: "info",
    });
  };

  const handleEditElection = (electionID) => {
    setMessage({
      text: `Edit Election ${electionID} functionality is not implemented yet.`,
      severity: "info",
    });
  };

  const handleDeleteElection = (electionID) => {
    setMessage({
      text: `Delete Election ${electionID} functionality is not implemented yet.`,
      severity: "warning",
    });
  };

  const handleViewDetails = (electionName) => {
    setMessage({
      text: `View details for ${electionName}.`,
      severity: "info",
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      {message.text && (
        <Alert severity={message.severity} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Manage Elections
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddElection}
          sx={{ mb: 3 }}
        >
          Add New Election
        </Button>

        {elections.length === 0 ? (
          <Alert severity="info" icon={<Info />}>
            No elections available.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {elections.map((election) => (
              <Grid item xs={12} key={election.ElectionID}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">
                      {election.ElectionName}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {election.Description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Start:</strong>{" "}
                          {new Date(election.StartDate).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>End:</strong>{" "}
                          {new Date(election.EndDate).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditElection(election.ElectionID)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteElection(election.ElectionID)}
                    >
                      Delete
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(election.ElectionName)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
