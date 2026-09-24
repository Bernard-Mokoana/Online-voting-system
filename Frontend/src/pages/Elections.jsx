import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../hooks/useAuth";
import axios from "../api/axios";
import ElectionList from "../components/ElectionList";
import Navigation from "../components/Navigation";

const Elections = () => {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [createDialog, setCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    electionName: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("/elections", {
        ElectionName: formData.electionName,
        Description: formData.description,
        StartDate: formData.startDate,
        EndDate: formData.endDate,
        IsActive: true,
        ElectionTypeID: 1,
        AdminID: user?.id,
      });
      setCreateDialog(false);
      setFormData({
        electionName: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Failed to create election. Please check your inputs.");
    }
  };

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                Elections
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}
              >
                All elections in the system.
              </Typography>
            </Box>
            {user?.role === "admin" && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialog(true)}
                sx={{
                  background: "#fff",
                  color: "#1a3a6b",
                  "&:hover": { background: "#e3e8f0" },
                }}
              >
                New Election
              </Button>
            )}
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <ElectionList key={refreshKey} type="all" />
        </Container>
      </Box>

      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Create New Election
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box
            component="form"
            id="election-form"
            onSubmit={handleCreate}
            sx={{ pt: 1 }}
          >
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Election Title
            </Typography>
            <TextField
              fullWidth
              value={formData.electionName}
              onChange={(e) =>
                setFormData({ ...formData, electionName: e.target.value })
              }
              required
              placeholder="e.g. Presidential Election 2025"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Start Date & Time
                </Typography>
                <TextField
                  fullWidth
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  End Date & Time
                </Typography>
                <TextField
                  fullWidth
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setCreateDialog(false)} sx={{ color: "#555" }}>
            Cancel
          </Button>
          <Button type="submit" form="election-form" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Elections;
