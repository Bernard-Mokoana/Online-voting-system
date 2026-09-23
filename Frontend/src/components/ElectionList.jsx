import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const ElectionList = ({ type = "active" }) => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const endpoint = type === "active" ? "/elections/active" : "/elections";
    axios
      .get(endpoint)
      .then((res) => setElections(res.data.data || res.data))
      .catch(() => setError(`Failed to load ${type} elections.`))
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) return <Typography variant="body2" sx={{ color: "#888", py: 2 }}>Loading elections…</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={2}>
      {elections.length === 0 ? (
        <Grid item xs={12}>
          <Alert severity="info">No {type} elections found.</Alert>
        </Grid>
      ) : (
        elections.map((election) => {
          const isActive = new Date(election.startDate) <= new Date() && new Date(election.endDate) >= new Date();
          return (
            <Grid item xs={12} sm={6} md={4} key={election.electionId}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: `3px solid ${isActive ? "#2e7d32" : "#9e9e9e"}`,
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, lineHeight: 1.3 }}>
                      {election.electionName}
                    </Typography>
                    <Chip
                      label={isActive ? "Active" : "Closed"}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 18,
                        fontSize: "0.65rem",
                        background: isActive ? "#e8f5e9" : "#f5f5f5",
                        color: isActive ? "#2e7d32" : "#777",
                        border: `1px solid ${isActive ? "#a5d6a7" : "#ddd"}`,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem", mb: 1.5 }}>
                    {election.description}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    {new Date(election.startDate).toLocaleDateString()} – {new Date(election.endDate).toLocaleDateString()}
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
                  {type === "active" && isActive && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<HowToVoteIcon sx={{ fontSize: "14px !important" }} />}
                      sx={{ fontSize: "0.75rem", background: "#2e7d32", "&:hover": { background: "#1b5e20" } }}
                      onClick={() => navigate(`/elections/${election.electionId}/vote`)}
                    >
                      Vote Now
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })
      )}
    </Grid>
  );
};

export default ElectionList;
