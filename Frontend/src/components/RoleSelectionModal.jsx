import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const RoleSelectionModal = ({ open, onClose, onSelect }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" align="center">
          Select Your Role
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => onSelect("admin")}
            sx={{ py: 2 }}
          >
            <Box sx={{ textAlign: "left", width: "100%" }}>
              <Typography variant="subtitle1" component="div">
                Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage candidates and view results
              </Typography>
            </Box>
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<HowToVoteIcon />}
            onClick={() => onSelect("voter")}
            sx={{ py: 2 }}
          >
            <Box sx={{ textAlign: "left", width: "100%" }}>
              <Typography variant="subtitle1" component="div">
                Voter
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cast your vote and view results
              </Typography>
            </Box>
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleSelectionModal;
