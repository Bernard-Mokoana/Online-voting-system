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
} from "@mui/material";
import { CalendarToday, Info, HowToVote } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [participatedElections, setParticipatedElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now, replace with API call
    const fetchElections = () => {
      setParticipatedElections([
        {
          electionid: 1,
          electionname: "Presidential Election 2025",
          description: "Vote for the next president.",
          enddate: "2025-05-10T18:00:00Z",
        },
      ]);
      setLoading(false);
    };
    fetchElections();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Welcome, {user?.firstName || "Candidate"}!
      </Typography>

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
            {participatedElections.map((election) => (
              <Grid item xs={12} md={6} key={election.electionid}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">
                      {election.electionname}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {election.description}
                    </Typography>
                    <Typography variant="body2">
                      End Date:{" "}
                      {new Date(election.enddate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Info />}
                      onClick={() =>
                        navigate(`/elections/${election.electionid}`)
                      }
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<HowToVote />}
                      onClick={() =>
                        navigate(`/elections/${election.electionid}/results`)
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
