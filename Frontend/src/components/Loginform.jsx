import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";

const API = "http://localhost:5000/api";

function App() {
  const [view, setView] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  useEffect(() => {
    if (token) {
      axios.get(`${API}/candidates`).then((res) => setCandidates(res.data));
    }
  }, [token]);

  const register = async () => {
    try {
      await axios.post(`${API}/register`, { username, password });
      setMessage("Registered! Please login.");
      setAlertType("success");
      setView("login");
    } catch {
      setMessage("Registration failed");
      setAlertType("error");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      setView("vote");
      setMessage("");
    } catch {
      setMessage("Login failed");
      setAlertType("error");
    }
  };

  const vote = async () => {
    try {
      await axios.post(
        `${API}/vote`,
        { candidate_id: selected },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Vote cast!");
      setAlertType("success");
      setView("results");
      getResults();
    } catch {
      setMessage("You have already voted");
      setAlertType("warning");
    }
  };

  const getResults = async () => {
    const res = await axios.get(`${API}/results`);
    setResults(res.data);
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setView("login");
    setUsername("");
    setPassword("");
    setMessage("");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar>
          <HowToVoteIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Online Voting System
          </Typography>
          {token && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        {message && (
          <Alert severity={alertType} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {!token && (
          <>
            <Typography variant="h5" align="center" gutterBottom>
              {view === "login" ? "Login" : "Register"}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                onClick={view === "login" ? login : register}
                fullWidth
              >
                {view === "login" ? "Login" : "Register"}
              </Button>
              <Button
                color="secondary"
                onClick={() => setView(view === "login" ? "register" : "login")}
                fullWidth
              >
                {view === "login"
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </Button>
            </Box>
          </>
        )}

        {token && view === "vote" && (
          <>
            <Typography variant="h5" align="center" gutterBottom>
              Vote for your candidate
            </Typography>
            <RadioGroup
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
            >
              {candidates.map((c) => (
                <FormControlLabel
                  key={c.id}
                  value={c.id}
                  control={<Radio />}
                  label={c.name}
                />
              ))}
            </RadioGroup>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={vote}
                disabled={!selected}
                fullWidth
              >
                Vote
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setView("results");
                  getResults();
                }}
                fullWidth
              >
                View Results
              </Button>
            </Box>
          </>
        )}

        {token && view === "results" && (
          <>
            <Typography variant="h5" align="center" gutterBottom>
              Results
            </Typography>
            <List>
              {results.map((r) => (
                <ListItem key={r.name}>
                  <ListItemText
                    primary={r.name}
                    secondary={`Votes: ${r.vote_count}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setView("vote")}
              fullWidth
            >
              Back to Vote
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default App;
// ... existing code ...
