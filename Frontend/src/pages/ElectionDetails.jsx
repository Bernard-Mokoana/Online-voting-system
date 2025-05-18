import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const ElectionDetails = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchElectionDetails();
  }, [electionId]);

  const fetchElectionDetails = async () => {
    try {
      const [electionResponse, candidatesResponse] = await Promise.all([
        axios.get(`/api/elections/${electionId}`),
        axios.get(`/api/elections/${electionId}/candidates`),
      ]);
      setElection(electionResponse.data);
      setCandidates(candidatesResponse.data);
    } catch (err) {
      setError("Failed to fetch election details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!election) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Election not found
        </Alert>
      </Container>
    );
  }

  const isActive =
    new Date(election.startDate) <= new Date() &&
    new Date(election.endDate) >= new Date();

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {election.title}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {election.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Election Period
          </Typography>
          <Typography>
            Start: {new Date(election.startDate).toLocaleString()}
          </Typography>
          <Typography>
            End: {new Date(election.endDate).toLocaleString()}
          </Typography>
          <Typography
            color={isActive ? "success.main" : "error.main"}
            sx={{ mt: 1 }}
          >
            Status: {isActive ? "Active" : "Inactive"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Candidates
        </Typography>

        <Grid container spacing={3}>
          {candidates.map((candidate) => (
            <Grid item xs={12} sm={6} md={4} key={candidate.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {`${candidate.firstName} ${candidate.lastName}`}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {candidate.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </Button>
          {isActive && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/elections/${electionId}/vote`)}
            >
              Vote Now
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ElectionDetails;
