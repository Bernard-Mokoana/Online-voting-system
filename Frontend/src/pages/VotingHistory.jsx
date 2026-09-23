import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import axios from "../api/axios";
import Navigation from "../components/Navigation";

const VotingHistory = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/votes/history")
      .then((res) => setVotes(res.data.data || []))
      .catch(() => setError("Failed to fetch voting history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <HistoryIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 22 }} />
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
              Voting History
            </Typography>
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {loading && <Typography variant="body2" sx={{ color: "#888" }}>Loading history…</Typography>}
          {error && <Alert severity="error">{error}</Alert>}

          {!loading && votes.length === 0 && !error && (
            <Alert severity="info">You have not voted in any elections yet.</Alert>
          )}

          {votes.length > 0 && (
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Election</TableCell>
                      <TableCell>Candidate Voted</TableCell>
                      <TableCell>Date &amp; Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {votes.map((vote, index) => (
                      <TableRow key={vote.voteId} sx={{ "&:nth-of-type(even)": { background: "#f7f7f7" } }}>
                        <TableCell sx={{ color: "#aaa", fontSize: "0.75rem", width: 40 }}>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                            {vote.election?.electionName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                            {vote.candidate?.firstName} {vote.candidate?.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {new Date(vote.votedAt).toLocaleString("en-ZA", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ px: 2, py: 1, borderTop: "1px solid #e0e0e0", background: "#fafafa" }}>
                <Typography variant="caption" sx={{ color: "#888" }}>
                  {votes.length} record{votes.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </>
  );
};

export default VotingHistory;
