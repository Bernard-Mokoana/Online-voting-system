import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../api/axios";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    electionId: "",
  });
  const [elections, setElections] = useState([]);

  useEffect(() => {
    fetchCandidates();
    fetchElections();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get("/api/candidates");
      setCandidates(response.data);
    } catch (err) {
      setError("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const response = await axios.get("/api/elections");
      setElections(response.data);
    } catch (err) {
      setError("Failed to fetch elections");
    }
  };

  const handleEdit = (candidate) => {
    setSelectedCandidate(candidate);
    setFormData({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      bio: candidate.bio,
      electionId: candidate.electionId,
    });
    setEditDialog(true);
  };

  const handleDelete = async (candidateId) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        await axios.delete(`/api/candidates/${candidateId}`);
        fetchCandidates();
      } catch (err) {
        setError("Failed to delete candidate");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCandidate) {
        await axios.put(`/api/candidates/${selectedCandidate.id}`, formData);
      } else {
        await axios.post("/api/candidates", formData);
      }
      setEditDialog(false);
      fetchCandidates();
    } catch (err) {
      setError("Failed to save candidate");
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
            Candidates
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedCandidate(null);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                bio: "",
                electionId: "",
              });
              setEditDialog(true);
            }}
          >
            Add Candidate
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Election</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>{`${candidate.firstName} ${candidate.lastName}`}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>
                    {
                      elections.find((e) => e.id === candidate.electionId)
                        ?.title
                    }
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(candidate)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(candidate.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedCandidate ? "Edit Candidate" : "Add Candidate"}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    margin="normal"
                    required
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                margin="normal"
                required
                multiline
                rows={4}
              />
              <TextField
                fullWidth
                select
                label="Election"
                name="electionId"
                value={formData.electionId}
                onChange={(e) =>
                  setFormData({ ...formData, electionId: e.target.value })
                }
                margin="normal"
                required
              >
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedCandidate ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Candidates;
