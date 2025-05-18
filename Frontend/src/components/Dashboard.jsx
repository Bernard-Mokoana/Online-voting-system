import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Paper,
  Fade,
  Zoom,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";

// Mock data for candidates
const mockCandidates = [
  {
    id: 1,
    name: "Totoro",
    image_url: "https://placehold.co/400x400/4CAF50/FFFFFF?text=Totoro",
    description: "The friendly forest spirit from My Neighbor Totoro",
    votes: 156,
    status: "active",
  },
  {
    id: 2,
    name: "Sophie",
    image_url: "https://placehold.co/400x400/2196F3/FFFFFF?text=Sophie",
    description: "The young heroine from Howl's Moving Castle",
    votes: 98,
    status: "active",
  },
  {
    id: 3,
    name: "Ponyo",
    image_url: "https://placehold.co/400x400/FF9800/FFFFFF?text=Ponyo",
    description: "The goldfish princess from Ponyo",
    votes: 142,
    status: "active",
  },
];

function Dashboard({ role }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCandidates(mockCandidates);
      const total = mockCandidates.reduce(
        (sum, candidate) => sum + candidate.votes,
        0
      );
      setTotalVotes(total);
      setLoading(false);
    } catch (error) {
      setError(`Failed to load candidates: ${error.message}`);
      setLoading(false);
    }
  };

  const handleVote = (candidateId) => {
    if (selectedCandidates.includes(candidateId)) {
      setSelectedCandidates(
        selectedCandidates.filter((id) => id !== candidateId)
      );
    } else {
      setSelectedCandidates([...selectedCandidates, candidateId]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const calculatePercentage = (votes) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  const handleEditClick = (candidate) => {
    setSelectedCandidate(candidate);
    setEditForm({
      name: candidate.name,
      description: candidate.description,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (candidate) => {
    setSelectedCandidate(candidate);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = () => {
    // Simulate API call
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === selectedCandidate.id
          ? { ...candidate, ...editForm }
          : candidate
      )
    );
    setEditDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Candidate updated successfully",
      severity: "success",
    });
  };

  const handleDeleteConfirm = () => {
    // Simulate API call
    setCandidates(
      candidates.filter((candidate) => candidate.id !== selectedCandidate.id)
    );
    setDeleteDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Candidate deleted successfully",
      severity: "success",
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading candidates...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchCandidates}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {showSuccess && (
        <Fade in={showSuccess}>
          <Alert
            severity="success"
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 1000,
              boxShadow: 3,
            }}
          >
            Vote cast successfully!
          </Alert>
        </Fade>
      )}

      {role === "admin" ? (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h4" component="h1">
                Admin Dashboard
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={fetchCandidates} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add New Candidate">
                  <IconButton color="primary">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="Manage Candidates" />
                <Tab label="View Results" />
              </Tabs>
            </Box>
          </Paper>

          {tabValue === 0 ? (
            <Grid container spacing={3}>
              {candidates.map((candidate) => (
                <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                  <Zoom in={true}>
                    <Card
                      elevation={3}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={candidate.image_url}
                        alt={candidate.name}
                        sx={{
                          width: "100%",
                          height: 250,
                          objectFit: "cover",
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                          {candidate.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {candidate.description}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={2}>
                          <Chip
                            icon={<HowToVoteIcon />}
                            label={`${candidate.votes} votes`}
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={candidate.status}
                            color="success"
                            variant="outlined"
                          />
                        </Stack>
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="Edit Candidate">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditClick(candidate)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Candidate">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(candidate)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={3} sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h4" gutterBottom>
                  Voting Results
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="h6" color="primary">
                    Total Votes: {totalVotes}
                  </Typography>
                  <Tooltip title="Export Results">
                    <IconButton color="primary">
                      <BarChartIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Grid container spacing={3}>
                {candidates.map((candidate) => {
                  const percentage = calculatePercentage(candidate.votes);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {candidate.name}
                          </Typography>
                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-flex",
                              width: "100%",
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={percentage}
                              size={120}
                              thickness={4}
                              sx={{ color: "primary.main" }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="h4"
                                component="div"
                                color="primary"
                              >
                                {percentage}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              {candidate.votes} votes
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          )}
        </>
      ) : (
        <>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon color="primary" />
              <Typography variant="h6">
                Select your favorite character to cast your vote
              </Typography>
            </Box>
          </Paper>
          <Grid container spacing={3}>
            {candidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                <Zoom in={true}>
                  <Card
                    elevation={3}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: 6,
                      },
                      cursor: "pointer",
                      border: selectedCandidates.includes(candidate.id)
                        ? "2px solid #1976d2"
                        : "none",
                    }}
                    onClick={() => handleVote(candidate.id)}
                  >
                    <Box
                      component="img"
                      src={candidate.image_url}
                      alt={candidate.name}
                      sx={{
                        width: "100%",
                        height: 250,
                        objectFit: "cover",
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        {candidate.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {candidate.description}
                      </Typography>
                      <Button
                        variant={
                          selectedCandidates.includes(candidate.id)
                            ? "contained"
                            : "outlined"
                        }
                        color="primary"
                        fullWidth
                        startIcon={
                          selectedCandidates.includes(candidate.id) ? (
                            <CheckCircleIcon />
                          ) : (
                            <HowToVoteIcon />
                          )
                        }
                        sx={{ mt: 2 }}
                      >
                        {selectedCandidates.includes(candidate.id)
                          ? "Selected"
                          : "Cast Vote"}
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Candidate</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Candidate</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedCandidate?.name}? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
