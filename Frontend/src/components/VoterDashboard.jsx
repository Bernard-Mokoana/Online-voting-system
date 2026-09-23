import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "./Navigation";

const VoterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeElections, setActiveElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/elections/active")
      .then((res) => setActiveElections(res.data.data || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        {/* Page header */}
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            Welcome back, {user?.firstName || "Voter"}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
            Cast your vote in an active election below.
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3, maxWidth: 1100, mx: "auto" }}>
          {/* Quick actions */}
          <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={() => navigate("/voting-history")}
              sx={{ borderColor: "#ccc", color: "#333", "&:hover": { borderColor: "#1a3a6b", color: "#1a3a6b" } }}
            >
              Voting History
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<InfoOutlinedIcon />}
              onClick={() => navigate("/profile")}
              sx={{ borderColor: "#ccc", color: "#333", "&:hover": { borderColor: "#1a3a6b", color: "#1a3a6b" } }}
            >
              My Profile
            </Button>
          </Box>

          {/* Active elections */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 18, color: "#1a3a6b" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Active Elections
            </Typography>
            {!loading && (
              <Chip
                label={activeElections.length}
                size="small"
                sx={{ background: "#1a3a6b", color: "#fff", fontWeight: 600, height: 20, fontSize: "0.75rem" }}
              />
            )}
          </Box>

          {loading ? (
            <Typography variant="body2" sx={{ color: "#888" }}>Loading elections…</Typography>
          ) : activeElections.length === 0 ? (
            <Alert severity="info" sx={{ maxWidth: 480 }}>
              There are no active elections at the moment. Check back later.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {activeElections.map((election) => (
                <Grid item xs={12} sm={6} md={4} key={election.electionId}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: "3px solid #2e7d32",
                      "&:hover": { borderLeftColor: "#1b5e20" },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {election.electionName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666", mb: 1.5, fontSize: "0.8rem" }}>
                        {election.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        Closes: {new Date(election.endDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ px: 2, py: 1, gap: 1 }}>
                      <Button
                        size="small"
                        sx={{ fontSize: "0.75rem", color: "#555" }}
                        onClick={() => navigate(`/elections/${election.electionId}`)}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<HowToVoteIcon sx={{ fontSize: "14px !important" }} />}
                        sx={{ fontSize: "0.75rem", background: "#2e7d32", "&:hover": { background: "#1b5e20" } }}
                        onClick={() => navigate(`/elections/${election.electionId}/vote`)}
                      >
                        Vote Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
};

export default VoterDashboard;
