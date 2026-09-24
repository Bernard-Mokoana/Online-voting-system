import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navigation from "../components/Navigation";

const Vote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`/elections/${electionId}`),
      axios.get(`/candidates?electionId=${electionId}`),
    ])
      .then(([elecRes, candRes]) => {
        setElection(elecRes.data.data || elecRes.data);
        setCandidates(candRes.data.data || []);
      })
      .catch(() => setError("Failed to load election data."))
      .finally(() => setLoading(false));
  }, [electionId]);

  const handleVote = async () => {
    if (!selectedCandidate || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await axios.post("/votes", {
        electionId: Number(electionId),
        candidateId: Number(selectedCandidate),
      });
      setSuccess("Your vote has been recorded successfully.");
      setTimeout(() => navigate("/voter-dashboard"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cast your vote. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            Cast Your Vote
          </Typography>
          {election && (
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.75)", mt: 0.5 }}
            >
              {election.electionname || election.electionName}
            </Typography>
          )}
        </Box>

        <Container maxWidth="md" sx={{ py: 3 }}>
          {loading ? (
            <Typography variant="body2" sx={{ color: "#888" }}>
              Loading candidates…
            </Typography>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success} Redirecting to dashboard…
                </Alert>
              )}

              {election && (
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, mb: 3, borderLeft: "3px solid #1a3a6b" }}
                >
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    {election.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1.5 }}>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      From: {new Date(election.startDate).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      To: {new Date(election.endDate).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              )}

              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <FormLabel
                  component="legend"
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                    mb: 1.5,
                    fontSize: "1rem",
                  }}
                >
                  Select a Candidate
                </FormLabel>
                <RadioGroup
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                >
                  {candidates.map((candidate) => (
                    <Card
                      key={candidate.candidateId} // FIX #15: was candidate.candidateid
                      variant="outlined"
                      onClick={() =>
                        !success &&
                        setSelectedCandidate(String(candidate.candidateId))
                      }
                      sx={{
                        mb: 1.5,
                        cursor: success ? "default" : "pointer",
                        borderLeft:
                          selectedCandidate === String(candidate.candidateId)
                            ? "3px solid #2e7d32"
                            : "3px solid transparent",
                        background:
                          selectedCandidate === String(candidate.candidateId)
                            ? "#f1f8e9"
                            : "#fff",
                        "&:hover": {
                          background: success ? undefined : "#f5f5f5",
                        },
                      }}
                    >
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <FormControlLabel
                          value={String(candidate.candidateId)} // FIX #15: was candidate.candidateid
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: "#2e7d32",
                                "&.Mui-checked": { color: "#2e7d32" },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                {candidate.firstName} {candidate.lastName}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#777", fontSize: "0.8rem" }}
                              >
                                {candidate.position}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0, width: "100%" }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/voter-dashboard")}
                  sx={{ color: "#555" }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<HowToVoteIcon />}
                  onClick={handleVote}
                  disabled={!selectedCandidate || !!success || submitting}
                  sx={{
                    background: "#2e7d32",
                    "&:hover": { background: "#1b5e20" },
                    px: 3,
                  }}
                >
                  Cast Vote
                </Button>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default Vote;
