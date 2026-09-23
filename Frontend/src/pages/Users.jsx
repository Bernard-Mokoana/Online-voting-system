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
  Chip,
  Avatar,
} from "@mui/material";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import axios from "../api/axios";
import Navigation from "../components/Navigation";

const roleColors = {
  admin: { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  voter: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  candidate: { bg: "#fce4ec", color: "#880e4f", border: "#f48fb1" },
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/admin/users")
      .then((res) => setUsers(res.data.data || []))
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleOutlineIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 22 }} />
            <Box>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                Users
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.25 }}>
                All registered users — read only in this release.
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
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Verified</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: "center", color: "#888", py: 4 }}>
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => {
                        const rc = roleColors[user.role] || { bg: "#f5f5f5", color: "#555", border: "#ddd" };
                        return (
                          <TableRow key={user.id} sx={{ "&:nth-of-type(even)": { background: "#f7f7f7" } }}>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar sx={{ width: 30, height: 30, fontSize: "0.75rem", background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                                  {user.firstName?.[0]}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                  {user.firstName} {user.lastName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#555" }}>
                                {user.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  background: rc.bg,
                                  color: rc.color,
                                  border: `1px solid ${rc.border}`,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.isVerified ? "Verified" : "Pending"}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  background: user.isVerified ? "#e8f5e9" : "#fff3e0",
                                  color: user.isVerified ? "#2e7d32" : "#e65100",
                                  border: `1px solid ${user.isVerified ? "#a5d6a7" : "#ffcc80"}`,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {users.length > 0 && (
                <Box sx={{ px: 2, py: 1, borderTop: "1px solid #e0e0e0", background: "#fafafa" }}>
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    {users.length} user{users.length !== 1 ? "s" : ""}
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

export default Users;
