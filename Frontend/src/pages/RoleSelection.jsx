import React from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HowToVoteIcon from "@mui/icons-material/HowToVote";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(role === "admin" ? "/login?role=admin" : "/login?role=voter");
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Online Voting System
        </Typography>
        <Typography color="text.secondary" paragraph>
          Please select your role to continue
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  cursor: "pointer",
                },
              }}
              onClick={() => handleRoleSelect("admin")}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <AdminPanelSettingsIcon
                  sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Administrator
                </Typography>
                <Typography color="text.secondary">
                  Manage elections, candidates, and users. Monitor voting
                  progress and results.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AdminPanelSettingsIcon />}
                >
                  Continue as Admin
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  cursor: "pointer",
                },
              }}
              onClick={() => handleRoleSelect("voter")}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <HowToVoteIcon
                  sx={{ fontSize: 60, color: "secondary.main", mb: 2 }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Voter
                </Typography>
                <Typography color="text.secondary">
                  Participate in active elections, cast your vote, and view
                  election results.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<HowToVoteIcon />}
                >
                  Continue as Voter
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default RoleSelection;
