import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Vote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate");
      return;
    }

    try {
      await axios.post("/api/votes", {
        electionId,
        candidateId: selectedCandidate,
      });
      setSuccess("Vote cast successfully");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError("Failed to cast vote");
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

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {election.title}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {election.description}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <FormControl component="fieldset" sx={{ width: "100%", mt: 3 }}>
          <FormLabel component="legend">Select a Candidate</FormLabel>
          <RadioGroup
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
          >
            {candidates.map((candidate) => (
              <Card key={candidate.id} sx={{ mb: 2, mt: 2 }}>
                <CardContent>
                  <FormControlLabel
                    value={candidate.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="h6">
                          {`${candidate.firstName} ${candidate.lastName}`}
                        </Typography>
                        <Typography color="text.secondary">
                          {candidate.bio}
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleVote}
            disabled={!selectedCandidate || !!success}
          >
            Cast Vote
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Vote;
