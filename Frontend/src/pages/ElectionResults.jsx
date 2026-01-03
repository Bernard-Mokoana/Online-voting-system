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
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`/votes/results/${electionId}`);
        setResults(response.data.results || []);
      } catch (err) {
        setError("No results found or election not started.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [electionId]);

  if (loading) return <CircularProgress />;

  // Calculate total from the view data
  const totalVotes = results.reduce((sum, r) => sum + parseInt(r.votecount), 0);

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Election Results
        </Typography>
        {error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Total Votes: {totalVotes}</Typography>
        </Box>

        <Grid container spacing={3}>
          {results.map((result, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{result.candidatename}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.position}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    <Box sx={{ width: "100%", mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(result.votepercentage)}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {result.votepercentage}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption">
                    {result.votecount} votes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ElectionResults;
