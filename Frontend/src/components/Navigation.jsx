import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AccountCircle from "@mui/icons-material/AccountCircle";
import HowToVoteIcon from "@mui/icons-material/HowToVote";

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/");
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const navBtn = {
    color: "#fff",
    fontWeight: 500,
    fontSize: "0.875rem",
    px: 1.5,
    py: 0.5,
    borderRadius: 1,
    "&:hover": { background: "rgba(255,255,255,0.15)" },
  };

  return (
    <AppBar position="static" sx={{ background: "#1a3a6b" }}>
      <Toolbar sx={{ minHeight: 52, px: { xs: 2, sm: 3 } }}>
        {/* Brand */}
        <Box
          sx={{ display: "flex", alignItems: "center", cursor: "pointer", mr: 4 }}
          onClick={() => navigate("/")}
        >
          <HowToVoteIcon sx={{ mr: 1, fontSize: 22, color: "#ffd700" }} />
          <Typography
            variant="subtitle1"
            component="span"
            sx={{ fontWeight: 700, color: "#fff", letterSpacing: "0.01em", lineHeight: 1 }}
          >
            VoteSystem
          </Typography>
        </Box>

        {/* Nav links */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 0.5 }}>
            {user.role === "admin" && (
              <>
                <Button sx={navBtn} onClick={() => navigate("/elections")}>
                  Elections
                </Button>
                <Button sx={navBtn} onClick={() => navigate("/candidates")}>
                  Candidates
                </Button>
                <Button sx={navBtn} onClick={() => navigate("/users")}>
                  Users
                </Button>
              </>
            )}
            {user.role === "voter" && (
              <Button sx={navBtn} onClick={() => navigate("/voter-dashboard")}>
                Dashboard
              </Button>
            )}
            {user.role === "candidate" && (
              <Button sx={navBtn} onClick={() => navigate("/candidate-dashboard")}>
                Dashboard
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* User menu */}
        {user ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.8)", mr: 0.5, fontSize: "0.8rem" }}
            >
              {user.firstName}
            </Typography>
            <IconButton
              size="small"
              aria-label="account"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ color: "#fff", p: 0.5 }}
            >
              <AccountCircle sx={{ fontSize: 28 }} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 0.5,
                  minWidth: 160,
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {user.role}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.firstName} {user.lastName}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfile} sx={{ fontSize: "0.875rem" }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ fontSize: "0.875rem", color: "#b71c1c" }}>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
