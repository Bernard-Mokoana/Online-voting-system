import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

// Test data
const initialCandidates = [
  { id: 1, name: "John Doe", votes: 150 },
  { id: 2, name: "Jane Smith", votes: 120 },
  { id: 3, name: "Bob Johnson", votes: 80 },
];

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("vote");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [hasVoted, setHasVoted] = useState(false);
  const [activeElections, setActiveElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActiveElections();
  }, []);

  const fetchActiveElections = async () => {
    try {
      const response = await axios.get("/api/elections/active");
      setActiveElections(response.data);
    } catch {
      setError("Failed to fetch active elections");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = () => {
    if (selectedCandidate) {
      setHasVoted(true);
      setMessage("Your vote has been recorded successfully!");
      setAlertType("success");
      // In a real app, this would make an API call to record the vote
    }
  };

  const handleViewResults = () => {
    setView("results");
  };

  const handleBackToVote = () => {
    setView("vote");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {message && (
        <Alert severity={alertType} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {view === "vote" ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cast Your Vote
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please select your preferred candidate from the list below.
          </Typography>

          <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
            <RadioGroup
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
            >
              {initialCandidates.map((candidate) => (
                <FormControlLabel
                  key={candidate.id}
                  value={candidate.id.toString()}
                  control={<Radio />}
                  label={candidate.name}
                  disabled={hasVoted}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<HowToVoteIcon />}
              onClick={handleVote}
              disabled={!selectedCandidate || hasVoted}
              fullWidth
            >
              {hasVoted ? "Vote Cast" : "Cast Vote"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={handleViewResults}
              fullWidth
            >
              View Results
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Election Results
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {initialCandidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {candidate.name}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {candidate.votes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      votes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Button variant="contained" onClick={handleBackToVote} fullWidth>
            Back to Voting
          </Button>
        </Paper>
      )}

      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" gutterBottom>
            Active Elections
          </Typography>
          {activeElections.length === 0 ? (
            <Typography color="text.secondary">
              No active elections at the moment.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {activeElections.map((election) => (
                <Grid item xs={12} md={6} lg={4} key={election.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {election.title}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {election.description}
                      </Typography>
                      <Typography variant="body2">
                        Start Date:{" "}
                        {new Date(election.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        End Date:{" "}
                        {new Date(election.endDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/elections/${election.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() =>
                          navigate(`/elections/${election.id}/vote`)
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
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" gutterBottom>
            Your Voting History
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/voting-history")}
          >
            View Voting History
          </Button>
        </Paper>
      </Grid>
    </Box>
  );
};

export default VoterDashboard;
