import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const ElectionList = ({ type = "active" }) => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchElections();
  }, [type]);

  const fetchElections = async () => {
    try {
      const endpoint =
        type === "active" ? "/api/elections/active" : "/api/elections";
      const response = await axios.get(endpoint);
      setElections(response.data);
    } catch (err) {
      setError(`Failed to fetch ${type} elections`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Grid container spacing={2}>
      {elections.length === 0 ? (
        <Grid item xs={12}>
          <Typography color="text.secondary">
            No {type} elections found.
          </Typography>
        </Grid>
      ) : (
        elections.map((election) => (
          <Grid item xs={12} md={6} lg={4} key={election.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {election.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {election.description}
                </Typography>
                <Typography variant="body2">
                  Start Date:{" "}
                  {new Date(election.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  End Date: {new Date(election.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Status: {election.status}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/elections/${election.id}`)}
                >
                  View Details
                </Button>
                {type === "active" && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => navigate(`/elections/${election.id}/vote`)}
                  >
                    Vote Now
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default ElectionList;
