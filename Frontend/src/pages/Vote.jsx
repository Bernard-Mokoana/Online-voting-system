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
    const fetchData = async () => {
      try {
        const [elecRes, candRes] = await Promise.all([
          axios.get(`/elections/${electionId}`),
          axios.get("/candidates"), // Fetch all and filter
        ]);

        setElection(elecRes.data.data || elecRes.data);

        // Filter candidates for this election
        const allCandidates = candRes.data.data || candRes.data;
        const relevantCandidates = allCandidates.filter(
          (c) =>
            c.electionid === parseInt(electionId) ||
            c.ElectionID === parseInt(electionId)
        );
        setCandidates(relevantCandidates);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [electionId]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    try {
      // Backend expects PascalCase keys for IDs
      await axios.post("/votes", {
        ElectionId: electionId,
        CandidateId: selectedCandidate,
      });
      setSuccess("Vote cast successfully");
      setTimeout(() => navigate("/voter-dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cast vote");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {election && (
          <>
            <Typography variant="h4" gutterBottom>
              {election.electionname}
            </Typography>
            <Typography paragraph>{election.description}</Typography>
          </>
        )}

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
              <Card
                key={candidate.candidateid}
                sx={{ mb: 2, mt: 2 }}
                variant="outlined"
              >
                <CardContent>
                  <FormControlLabel
                    value={candidate.candidateid}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="h6">
                          {candidate.firstname} {candidate.lastname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {candidate.position}
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
          <Button onClick={() => navigate("/voter-dashboard")}>Cancel</Button>
          <Button
            variant="contained"
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
