import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "../api/axios";

const VotingHistory = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVotingHistory();
  }, []);

  const fetchVotingHistory = async () => {
    try {
      const response = await axios.get("/api/votes/history");
      setVotes(response.data);
    } catch (err) {
      setError("Failed to fetch voting history");
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

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Voting History
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {votes.length === 0 ? (
          <Typography color="text.secondary">
            You haven't voted in any elections yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Election</TableCell>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Date Voted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {votes.map((vote) => (
                  <TableRow key={vote.id}>
                    <TableCell>{vote.election.title}</TableCell>
                    <TableCell>
                      {`${vote.candidate.firstName} ${vote.candidate.lastName}`}
                    </TableCell>
                    <TableCell>
                      {new Date(vote.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default VotingHistory;
