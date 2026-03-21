import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import axios from "../api/axios";
import ElectionList from "../components/ElectionList";

const Elections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createDialog, setCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    electionName: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/elections", {
        ElectionName: formData.electionName,
        Description: formData.description,
        StartDate: formData.startDate,
        EndDate: formData.endDate,
        IsActive: true,
        ElectionTypeID: 1,
        AdminID: user.id,
      });
      setCreateDialog(false);
      setFormData({
        electionName: "",
        description: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      setError("Failed to create election");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" component="h1">
            Elections
          </Typography>
          {user?.role === "admin" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateDialog(true)}
            >
              Create Election
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ElectionList type="all" />

        <Dialog
          open={createDialog}
          onClose={() => setCreateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Election</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreate} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="electionName"
                value={formData.electionName}
                onChange={(e) =>
                  setFormData({ ...formData, electionName: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                margin="normal"
                required
                multiline
                rows={4}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    margin="normal"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    margin="normal"
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Elections;
