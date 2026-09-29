import React, { useState, useEffect, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import axios from "../api/axios";
import Navigation from "./Navigation";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mockElections = useMemo(
    () => [
      {
        electionId: 1,
        electionName: "Presidential Election 2025",
        description: "Vote for the next president.",
        startDate: "2025-05-01T08:00:00Z",
        endDate: "2025-05-10T18:00:00Z",
      },
      {
        electionId: 2,
        electionName: "Local Council Election 2025",
        description: "Vote for your local council representatives.",
        startDate: "2025-06-01T08:00:00Z",
        endDate: "2025-06-05T18:00:00Z",
      },
    ],
    [],
  );

  const [elections, setElections] = useState([]);
  const [message, setMessage] = useState({ text: "", severity: "info" });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [formData, setFormData] = useState({
    electionName: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const fetchElections = () =>
    axios
      .get("/elections")
      .then((res) => setElections(res.data.data || []))
      .catch(() => {
        setElections(mockElections);
        setMessage({
          text: "Using demo data — could not reach server.",
          severity: "warning",
        });
      });

  useEffect(() => {
    fetchElections();
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
        AdminID: user?.id,
      });
      setCreateDialog(false);
      setFormData({
        electionName: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      await fetchElections();
      setMessage({
        text: "Election created successfully.",
        severity: "success",
      });
    } catch {
      setMessage({ text: "Failed to create election.", severity: "error" });
    }
  };

  // FIX #12: Edit handler — opens edit dialog pre-populated with election data
  const handleEditOpen = (election) => {
    setSelectedElection(election);
    setFormData({
      electionName: election.electionName,
      description: election.description,
      startDate: election.startDate ? election.startDate.slice(0, 16) : "",
      endDate: election.endDate ? election.endDate.slice(0, 16) : "",
    });
    setEditDialog(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/elections/${selectedElection.electionId}`, {
        ElectionName: formData.electionName,
        Description: formData.description,
        StartDate: formData.startDate,
        EndDate: formData.endDate,
        IsActive: selectedElection.isActive,
        ElectionTypeID: selectedElection.electionTypeId || 1,
        AdminID: user?.id,
      });
      setEditDialog(false);
      setSelectedElection(null);
      await fetchElections();
      setMessage({
        text: "Election updated successfully.",
        severity: "success",
      });
    } catch {
      setMessage({ text: "Failed to update election.", severity: "error" });
    }
  };

  // FIX #12: Delete handler — prompts confirmation then deletes
  const handleDeleteOpen = (election) => {
    setSelectedElection(election);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/elections/${selectedElection.electionId}`);
      setDeleteDialog(false);
      setSelectedElection(null);
      await fetchElections();
      setMessage({
        text: "Election deleted successfully.",
        severity: "success",
      });
    } catch {
      setMessage({ text: "Failed to delete election.", severity: "error" });
    }
  };

  const isActive = (el) =>
    new Date(el.startDate) <= new Date() && new Date(el.endDate) >= new Date();

  const renderElectionFormFields = () => (
    <>
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
        placeholder="Describe this election…"
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
    </>
  );

  return (
    <>
      <Navigation />
      <Box sx={{ background: "#f0f2f5", minHeight: "calc(100vh - 52px)" }}>
        {/* Page header */}
        <Box sx={{ background: "#1a3a6b", px: { xs: 2, sm: 4 }, py: 2.5 }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
            Admin Dashboard
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}
          >
            Manage elections, candidates, and users.
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3, maxWidth: 1100, mx: "auto" }}>
          {message.text && (
            <Alert
              severity={message.severity}
              sx={{ mb: 2 }}
              onClose={() => setMessage({ text: "", severity: "info" })}
            >
              {message.text}
            </Alert>
          )}

          {/* Section header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 18, color: "#1a3a6b" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Elections
              </Typography>
              <Chip
                label={elections.length}
                size="small"
                sx={{
                  background: "#1a3a6b",
                  color: "#fff",
                  fontWeight: 600,
                  height: 20,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
            >
              New Election
            </Button>
          </Box>

          {elections.length === 0 ? (
            <Alert severity="info">
              No elections yet. Create one to get started.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {elections.map((election) => (
                <Grid item xs={12} sm={6} md={4} key={election.electionId}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: `3px solid ${isActive(election) ? "#2e7d32" : "#9e9e9e"}`,
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, flex: 1 }}
                        >
                          {election.electionName}
                        </Typography>
                        <Chip
                          label={isActive(election) ? "Active" : "Inactive"}
                          size="small"
                          sx={{
                            ml: 1,
                            height: 18,
                            fontSize: "0.65rem",
                            background: isActive(election)
                              ? "#e8f5e9"
                              : "#f5f5f5",
                            color: isActive(election) ? "#2e7d32" : "#777",
                            border: `1px solid ${isActive(election) ? "#a5d6a7" : "#ddd"}`,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666", fontSize: "0.8rem", mb: 1.5 }}
                      >
                        {election.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#999", display: "block" }}
                      >
                        {new Date(election.startDate).toLocaleDateString()} –{" "}
                        {new Date(election.endDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <Divider />
                    {/* FIX #12: All buttons now have working onClick handlers */}
                    <CardActions sx={{ px: 1.5, py: 0.75, gap: 0.5 }}>
                      <Button
                        size="small"
                        startIcon={
                          <EditIcon sx={{ fontSize: "14px !important" }} />
                        }
                        sx={{ fontSize: "0.75rem", color: "#555" }}
                        onClick={() => handleEditOpen(election)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={
                          <DeleteIcon sx={{ fontSize: "14px !important" }} />
                        }
                        sx={{ fontSize: "0.75rem", color: "#b71c1c" }}
                        onClick={() => handleDeleteOpen(election)}
                      >
                        Delete
                      </Button>
                      <Button
                        size="small"
                        startIcon={
                          <VisibilityIcon
                            sx={{ fontSize: "14px !important" }}
                          />
                        }
                        sx={{ fontSize: "0.75rem", color: "#555" }}
                        onClick={() =>
                          navigate(`/elections/${election.electionId}`)
                        }
                      >
                        View
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Create Election Dialog */}
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
            id="create-form"
            onSubmit={handleCreate}
            sx={{ pt: 1 }}
          >
            {renderElectionFormFields()}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setCreateDialog(false)} sx={{ color: "#555" }}>
            Cancel
          </Button>
          <Button type="submit" form="create-form" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Election Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Edit Election</DialogTitle>
        <Divider />
        <DialogContent>
          <Box
            component="form"
            id="edit-form"
            onSubmit={handleEdit}
            sx={{ pt: 1 }}
          >
            {renderElectionFormFields()}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setEditDialog(false)} sx={{ color: "#555" }}>
            Cancel
          </Button>
          <Button type="submit" form="edit-form" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Delete Election
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete{" "}
            <strong>{selectedElection?.electionName}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setDeleteDialog(false)} sx={{ color: "#555" }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
