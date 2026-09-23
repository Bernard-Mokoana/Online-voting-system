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
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import Navigation from "./Navigation";

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [participatedElections, setParticipatedElections] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) {
      setLoading(false);
      return;
    }
    Promise.all([
      axios.get("/candidates/elections"),
      axios.get(`/candidates/${authUser.id}`),
    ])
      .then(([electionsRes, candidateRes]) => {
        const elections = electionsRes.data.data || [];
        const unique = elections.filter(
          (el, i, self) => i === self.findIndex((t) => t.electionId === el.electionId)
        );
        setParticipatedElections(unique);
        setCandidateProfile(candidateRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authUser]);

  const displayName = candidateProfile?.firstName || authUser?.firstName || "Candidate";

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        {/* Page header */}
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            Welcome back, {displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
            Track your election participation and campaign results.
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3, maxWidth: 1100, mx: "auto" }}>
          {/* Profile card */}
          {candidateProfile && (
            <Card variant="outlined" sx={{ mb: 3, display: "flex", alignItems: "center", p: 2.5, gap: 2.5 }}>
              <Avatar
                src={candidateProfile.profileImage}
                alt={`${candidateProfile.firstName} ${candidateProfile.lastName}`}
                sx={{ width: 72, height: 72, border: "2px solid #e0e0e0" }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {candidateProfile.firstName} {candidateProfile.lastName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <PersonOutlineIcon sx={{ fontSize: 14, color: "#999" }} />
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {candidateProfile.position}
                  </Typography>
                </Box>
                {candidateProfile.biography && (
                  <Typography variant="body2" sx={{ color: "#777", mt: 1, maxWidth: 480, fontSize: "0.8rem" }}>
                    {candidateProfile.biography}
                  </Typography>
                )}
              </Box>
            </Card>
          )}

          {/* Elections section */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 18, color: "#1a3a6b" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Elections You Are Participating In
            </Typography>
            {!loading && (
              <Chip
                label={participatedElections.length}
                size="small"
                sx={{ background: "#1a3a6b", color: "#fff", fontWeight: 600, height: 20, fontSize: "0.75rem" }}
              />
            )}
          </Box>

          {loading ? (
            <Typography variant="body2" sx={{ color: "#888" }}>Loading elections…</Typography>
          ) : participatedElections.length === 0 ? (
            <Alert severity="info" sx={{ maxWidth: 500 }}>
              You are not participating in any elections at the moment.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {participatedElections.map((election, index) => (
                <Grid item xs={12} sm={6} md={4} key={`${election.electionId}-${index}`}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: "3px solid #b71c1c",
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
                        startIcon={<InfoOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                        sx={{ fontSize: "0.75rem", color: "#555" }}
                        onClick={() => navigate(`/elections/${election.electionId}`)}
                      >
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<BarChartIcon sx={{ fontSize: "14px !important" }} />}
                        sx={{ fontSize: "0.75rem", background: "#b71c1c", "&:hover": { background: "#7f0000" } }}
                        onClick={() => navigate(`/elections/${election.electionId}/results`)}
                      >
                        Results
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

export default CandidateDashboard;
