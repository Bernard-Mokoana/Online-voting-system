import React, { useEffect, useState } from "react";
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
  Paper,
  Avatar,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import axios from "../api/axios";
import Navigation from "../components/Navigation";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/candidates")
      .then((res) => setCandidates(res.data.data || []))
      .catch(() => setError("Failed to load candidates."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonOutlineIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 22 }} />
            <Box>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                Candidates
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.25 }}>
                All registered candidates — read only in this release.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <Typography variant="body2" sx={{ color: "#888" }}>Loading…</Typography>}

          {!loading && (
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Election ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {candidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: "center", color: "#888", py: 4 }}>
                          No candidates found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidates.map((candidate) => (
                        <TableRow key={candidate.candidateId} sx={{ "&:nth-of-type(even)": { background: "#f7f7f7" } }}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                src={candidate.profileImage}
                                sx={{ width: 30, height: 30, fontSize: "0.75rem", border: "1px solid #e0e0e0" }}
                              >
                                {candidate.firstName?.[0]}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                {candidate.firstName} {candidate.lastName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#555" }}>
                              {candidate.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                              {candidate.position}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: "#888" }}>
                              #{candidate.electionId}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {candidates.length > 0 && (
                <Box sx={{ px: 2, py: 1, borderTop: "1px solid #e0e0e0", background: "#fafafa" }}>
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Container>
      </Box>
    </>
  );
};

export default Candidates;
