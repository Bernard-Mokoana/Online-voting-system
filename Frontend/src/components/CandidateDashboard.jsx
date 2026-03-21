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
import { CalendarToday, Info, HowToVote, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [participatedElections, setParticipatedElections] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [electionsResponse, candidateResponse] = await Promise.all([
          axios.get("/candidates/elections"),
          axios.get(`/candidates/${authUser.id}`),
        ]);
        const elections = electionsResponse.data.data || [];
        const uniqueElections = elections.filter(
          (election, index, self) =>
            index ===
            self.findIndex((t) => t.electionId === election.electionId)
        );
        setParticipatedElections(uniqueElections);
        setCandidateProfile(candidateResponse.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser]);

  const handleLogout = () => {
    logout();
    navigate("/candidate-login");
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
        <Typography variant="h5" component="div">
          Welcome,{" "}
          {candidateProfile?.firstName || authUser?.firstName || "Candidate"}!
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Logout />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {candidateProfile && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item>
              <Avatar
                src={candidateProfile.profileImage}
                alt={`${candidateProfile.firstName} ${candidateProfile.lastName}`}
                sx={{ width: 120, height: 120 }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h6">
                {candidateProfile.firstName} {candidateProfile.lastName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {candidateProfile.position}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {candidateProfile.biography}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <CalendarToday sx={{ verticalAlign: "middle", mr: 1 }} />
          Elections You Are Participating In
        </Typography>

        {participatedElections.length === 0 ? (
          <Alert severity="info">
            You are not participating in any active elections at the moment.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {participatedElections.map((election, index) => (
              <Grid item xs={12} md={6} key={`${election.electionId}-${index}`}>
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
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<HowToVote />}
                      onClick={() =>
                        navigate(`/elections/${election.electionId}/results`)
                      }
                    >
                      View Results
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

export default CandidateDashboard;
