import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navigation from "../components/Navigation";

const ElectionDetails = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`/elections/${electionId}`),
      axios.get(`/candidates?electionId=${electionId}`),
    ])
      .then(([electionRes, candidatesRes]) => {
        setElection(electionRes.data.data || null);
        setCandidates(candidatesRes.data.data || []);
      })
      .catch(() => setError("Failed to load election details."))
      .finally(() => setLoading(false));
  }, [electionId]);

  if (loading) return (
    <>
      <Navigation />
      <Box sx={{ px: 4, py: 3 }}><Typography variant="body2" sx={{ color: "#888" }}>Loading…</Typography></Box>
    </>
  );

  if (!election) return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Election not found.</Alert>
      </Container>
    </>
  );

  const isActive = new Date(election.startDate) <= new Date() && new Date(election.endDate) >= new Date();

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            {election.electionName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
            <Chip
              label={isActive ? "Active" : "Closed"}
              size="small"
              sx={{
                background: isActive ? "#e8f5e9" : "#f5f5f5",
                color: isActive ? "#2e7d32" : "#777",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 20,
              }}
            />
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
              {new Date(election.startDate).toLocaleDateString()} – {new Date(election.endDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderLeft: "3px solid #1a3a6b" }}>
            <Typography variant="body1" sx={{ color: "#444" }}>{election.description}</Typography>
          </Paper>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PersonOutlineIcon sx={{ fontSize: 18, color: "#1a3a6b" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Candidates ({candidates.length})
            </Typography>
          </Box>

          {candidates.length === 0 ? (
            <Alert severity="info">No candidates registered for this election yet.</Alert>
          ) : (
            <Grid container spacing={2}>
              {candidates.map((candidate) => (
                <Grid item xs={12} sm={6} md={4} key={candidate.candidateId}>
                  <Card variant="outlined" sx={{ display: "flex", gap: 2, p: 2, alignItems: "flex-start" }}>
                    <Avatar
                      src={candidate.profileImage}
                      sx={{ width: 48, height: 48, border: "1px solid #e0e0e0", flexShrink: 0 }}
                    >
                      {candidate.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {candidate.firstName} {candidate.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#777", fontSize: "0.8rem", mb: 0.5 }}>
                        {candidate.position}
                      </Typography>
                      {candidate.biography && (
                        <Typography variant="caption" sx={{ color: "#999", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {candidate.biography}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              sx={{ color: "#555" }}
            >
              Back to Dashboard
            </Button>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<BarChartIcon />}
                onClick={() => navigate(`/elections/${electionId}/results`)}
              >
                View Results
              </Button>
              {isActive && (
                <Button
                  variant="contained"
                  startIcon={<HowToVoteIcon />}
                  onClick={() => navigate(`/elections/${electionId}/vote`)}
                  sx={{ background: "#2e7d32", "&:hover": { background: "#1b5e20" } }}
                >
                  Vote Now
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ElectionDetails;
