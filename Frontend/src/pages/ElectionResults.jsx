import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

const ElectionResults = () => {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, [electionId]);

  const fetchResults = async () => {
    try {
      const [electionResponse, resultsResponse] = await Promise.all([
        axios.get(`/api/elections/${electionId}`),
        axios.get(`/api/elections/${electionId}/results`),
      ]);
      setElection(electionResponse.data);
      setResults(resultsResponse.data);
    } catch (err) {
      setError("Failed to fetch election results");
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

  const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {election.title} - Results
        </Typography>
        <Typography color="text.secondary" paragraph>
          {election.description}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Total Votes: {totalVotes}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {results.map((result) => {
            const percentage =
              totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0;
            return (
              <Grid item xs={12} key={result.candidateId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {`${result.candidate.firstName} ${result.candidate.lastName}`}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${Math.round(percentage)}%`}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {result.votes} votes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ElectionResults;
