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
  CircularProgress,
  Avatar,
} from "@mui/material";
import { CalendarToday, Info, HowToVote, History } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const VoterDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeElections, setActiveElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("/elections/active");
        setActiveElections(res.data.data || res.data);
      } catch (error) {
        console.error("Error fetching elections", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            alt={user?.firstName || "Voter"}
            src={user?.profileImageUrl}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Welcome, {user?.firstName || "Voter"}!
          </Typography>
        </Box>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <CalendarToday sx={{ verticalAlign: "middle", mr: 1 }} />
          Active Elections
        </Typography>

        {activeElections.length === 0 ? (
          <Alert severity="info">No active elections at the moment.</Alert>
        ) : (
          <Grid container spacing={2}>
            {activeElections.map((election) => (
              <Grid item xs={12} md={6} key={election.electionId}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">
                      {election.electionName}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {election.description}
                    </Typography>
                    <Typography variant="body2">
                      End Date:{" "}
                      {new Date(election.endDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Info />}
                      onClick={() =>
                        navigate(`/elections/${election.electionId}`)
                      }
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<HowToVote />}
                      onClick={() =>
                        navigate(`/elections/${election.electionId}/vote`)
                      }
                    >
                      Vote Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <History sx={{ mr: 1 }} />
          Actions
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/voting-history")}>
          View Voting History
        </Button>
      </Paper>
    </Box>
  );
};

export default VoterDashboard;
