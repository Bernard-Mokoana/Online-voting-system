import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import Navigation from "../components/Navigation";

const ElectionResults = () => {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`/votes/results/${electionId}`)
      .then((res) => setResults(res.data.data || []))
      .catch(() => setError("Results are not yet available for this election."))
      .finally(() => setLoading(false));
  }, [electionId]);

  const sorted = [...results].sort(
    (a, b) => Number(b.voteCount) - Number(a.voteCount),
  );
  const totalVotes = sorted.reduce((sum, r) => sum + Number(r.voteCount), 0);
  const winner = totalVotes > 0 ? sorted[0] : null;

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <BarChartIcon
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: 22 }}
            />
            <Box>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                Election Results
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)", mt: 0.25 }}
              >
                Total votes cast: {loading ? "…" : totalVotes}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Container maxWidth="md" sx={{ py: 3 }}>
          {loading && (
            <Typography variant="body2" sx={{ color: "#888" }}>
              Loading results…
            </Typography>
          )}
          {error && <Alert severity="info">{error}</Alert>}

          {!loading && results.length > 0 && (
            <>
              {/* Winner banner */}
              {winner && (
                <Box
                  sx={{
                    background: "#fff",
                    border: "1px solid #ffd700",
                    borderLeft: "4px solid #ffd700",
                    borderRadius: 1,
                    p: 2,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <EmojiEventsIcon sx={{ color: "#f9a825", fontSize: 32 }} />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#999",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Leading Candidate
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    >
                      {winner.candidateName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {winner.voteCount} votes &mdash; {winner.votePercentage}%
                    </Typography>
                  </Box>
                </Box>
              )}

              <Grid container spacing={2}>
                {results.map((result, index) => (
                  <Grid item xs={12} key={index}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderLeft:
                          index === 0
                            ? "3px solid #ffd700"
                            : "3px solid #e0e0e0",
                      }}
                    >
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {result.candidateName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#888" }}
                            >
                              {result.position}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {result.voteCount}{" "}
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{ color: "#888" }}
                              >
                                votes
                              </Typography>
                            </Typography>
                            <Chip
                              label={`${result.votePercentage}%`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.7rem",
                                background: index === 0 ? "#fff8e1" : "#f5f5f5",
                                border: `1px solid ${index === 0 ? "#ffd700" : "#ddd"}`,
                                color: index === 0 ? "#f57f17" : "#666",
                              }}
                            />
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Number(result.votePercentage)}
                          sx={{
                            "& .MuiLinearProgress-bar": {
                              background: index === 0 ? "#2e7d32" : "#9e9e9e",
                            },
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default ElectionResults;
