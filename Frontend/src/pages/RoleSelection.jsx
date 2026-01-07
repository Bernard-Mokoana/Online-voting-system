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
import PersonIcon from "@mui/icons-material/Person";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
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

        <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <AdminPanelSettingsIcon
                  sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Admin
                </Typography>
                <Typography color="text.secondary">
                  Manage elections, users, and system settings.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handleNavigate("/admin-login")}
                >
                  Login
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <HowToVoteIcon
                  sx={{ fontSize: 60, color: "secondary.main", mb: 2 }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Voter
                </Typography>
                <Typography color="text.secondary">
                  Cast your vote in active elections and view results.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => handleNavigate("/login")}
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => handleNavigate("/register")}
                >
                  Register
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <PersonIcon
                  sx={{ fontSize: 60, color: "success.main", mb: 2 }}
                />
                <Typography variant="h5" component="h2" gutterBottom>
                  Candidate
                </Typography>
                <Typography color="text.secondary">
                  Manage your profile, view election information, and track
                  your campaign.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  size="large"
                  onClick={() => handleNavigate("/candidate-login")}
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={() => handleNavigate("/candidate-register")}
                >
                  Register
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
