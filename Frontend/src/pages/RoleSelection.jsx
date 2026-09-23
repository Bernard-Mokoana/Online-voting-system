import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PersonIcon from "@mui/icons-material/Person";
import HowToVoteOutlinedIcon from "@mui/icons-material/HowToVoteOutlined";

const roles = [
  {
    label: "Administrator",
    description: "Manage elections, candidates, and system settings.",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#1a3a6b" }} />,
    loginPath: "/admin-login",
    registerPath: null,
    borderColor: "#1a3a6b",
  },
  {
    label: "Voter",
    description: "Cast your ballot in active elections and view results.",
    icon: <HowToVoteIcon sx={{ fontSize: 40, color: "#2e7d32" }} />,
    loginPath: "/login",
    registerPath: "/register",
    borderColor: "#2e7d32",
  },
  {
    label: "Candidate",
    description: "View elections you are participating in and track results.",
    icon: <PersonIcon sx={{ fontSize: 40, color: "#b71c1c" }} />,
    loginPath: "/candidate-login",
    registerPath: "/candidate-register",
    borderColor: "#b71c1c",
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2, gap: 1.5 }}>
          <HowToVoteOutlinedIcon sx={{ fontSize: 38, color: "#1a3a6b" }} />
          <Typography variant="h4" sx={{ color: "#1a3a6b", fontWeight: 700 }}>
            Online Voting System
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "#555", maxWidth: 420, mx: "auto" }}>
          A secure, transparent platform for democratic elections.
          Select your role below to continue.
        </Typography>
      </Box>

      {/* Role cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          width: "100%",
          maxWidth: 860,
        }}
      >
        {roles.map((role) => (
          <Paper
            key={role.label}
            variant="outlined"
            sx={{
              flex: 1,
              p: 3,
              borderTop: `4px solid ${role.borderColor}`,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              background: "#fff",
              "&:hover": {
                boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
              },
            }}
          >
            <Box sx={{ mb: 1.5 }}>{role.icon}</Box>
            <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
              {role.label}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mb: 3, flexGrow: 1 }}>
              {role.description}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              <Button
                variant="contained"
                size="small"
                sx={{
                  background: role.borderColor,
                  "&:hover": { background: role.borderColor, filter: "brightness(1.1)" },
                  flex: 1,
                }}
                onClick={() => navigate(role.loginPath)}
              >
                Sign In
              </Button>
              {role.registerPath && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: role.borderColor, color: role.borderColor, flex: 1 }}
                  onClick={() => navigate(role.registerPath)}
                >
                  Register
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      <Typography variant="caption" sx={{ color: "#aaa", mt: 5 }}>
        © {new Date().getFullYear()} Online Voting System — All rights reserved
      </Typography>
    </Box>
  );
};

export default RoleSelection;
