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
} from "@mui/material";
import {
  HowToVote,
  Visibility,
  History,
  CalendarToday,
  Info,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VoterDashboard = () => {
  const navigate = useNavigate();

  // Mock data for fallback
  const mockActiveElections = [
    {
      ElectionID: 1,
      ElectionName: "Presidential Election 2025",
      Description: "Vote for the next president.",
      StartDate: "2025-05-01T08:00:00Z",
      EndDate: "2025-05-10T18:00:00Z",
    },
  ];

  const mockCandidates = [
    {
      CandidateID: 1,
      FirstName: "John",
      LastName: "Doe",
      Party: "Democratic",
      Votes: 120,
    },
    {
      CandidateID: 2,
      FirstName: "Jane",
      LastName: "Smith",
      Party: "Republican",
      Votes: 150,
    },
  ];

  const mockUser = {
    firstname: "Alice",
    hasVoted: false,
  };

  const [activeElections, setActiveElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState({});
  const [view, setView] = useState("vote");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [message, setMessage] = useState({ text: "", severity: "info" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from the backend
        const [electionsRes, candidatesRes, userRes] = await Promise.all([
          axios.get("/api/elections/active"),
          axios.get("/api/candidates"),
          axios.get("/api/voters"),
        ]);

        setActiveElections(
          Array.isArray(electionsRes.data) ? electionsRes.data : []
        );
        setCandidates(
          Array.isArray(candidatesRes.data) ? candidatesRes.data : []
        );
        setUser(userRes.data || {});
      } catch (error) {
        console.error("Backend error:", error);
        // Fallback to mock data
        setActiveElections(mockActiveElections);
        setCandidates(mockCandidates);
        setUser(mockUser);
        setMessage({
          text: "Unable to fetch data from the server. Using fallback data.",
          severity: "warning",
        });
      }
    };

    fetchData();
  }, []);

  const handleVote = () => {
    if (!selectedCandidate) return;

    setMessage({
      text: "Your vote has been recorded successfully!",
      severity: "success",
    });
    setView("results");
  };

  const handleViewResults = () => setView("results");
  const handleBackToVote = () => setView("vote");

  return (
    <Box sx={{ p: 2 }}>
      {message.text && (
        <Alert severity={message.severity} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Welcome, {user.firstname || "User"}!
      </Typography>

      {view === "vote" ? (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <HowToVote sx={{ verticalAlign: "middle", mr: 1 }} />
            Cast Your Vote
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Select your preferred candidate:
          </Typography>

          <FormControl component="fieldset" sx={{ width: "100%", mb: 3 }}>
            <RadioGroup
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
            >
              {candidates.map((candidate) => (
                <FormControlLabel
                  key={candidate.CandidateID}
                  value={candidate.CandidateID.toString()}
                  control={<Radio />}
                  label={`${candidate.FirstName} ${candidate.LastName} (${candidate.Party})`}
                  disabled={user.hasVoted}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<HowToVote />}
              onClick={handleVote}
              disabled={!selectedCandidate || user.hasVoted}
              fullWidth
            >
              {user.hasVoted ? "Already Voted" : "Submit Vote"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={handleViewResults}
              fullWidth
            >
              View Results
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Visibility sx={{ verticalAlign: "middle", mr: 1 }} />
            Election Results
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {candidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate.CandidateID}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {candidate.FirstName} {candidate.LastName}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {candidate.Party}
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
                      {candidate.Votes || 0}
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

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <CalendarToday sx={{ verticalAlign: "middle", mr: 1 }} />
          Active Elections
        </Typography>

        {activeElections.length === 0 ? (
          <Alert severity="info" icon={<Info />}>
            No active elections at the moment.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {activeElections.map((election) => (
              <Grid item xs={12} key={election.ElectionID}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6">
                      {election.ElectionName}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {election.Description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Start:</strong>{" "}
                          {new Date(election.StartDate).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>End:</strong>{" "}
                          {new Date(election.EndDate).toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Info />}
                      onClick={() =>
                        navigate(`/elections/${election.ElectionID}`)
                      }
                    >
                      Details
                    </Button>
                    {!user.hasVoted && (
                      <Button
                        size="small"
                        startIcon={<HowToVote />}
                        onClick={() =>
                          navigate(`/elections/${election.ElectionID}/vote`)
                        }
                      >
                        Vote Now
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <History sx={{ verticalAlign: "middle", mr: 1 }} />
          Voting History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={() => navigate("/voting-history")}
        >
          View Complete Voting History
        </Button>
      </Paper>
    </Box>
  );
};

export default VoterDashboard;
