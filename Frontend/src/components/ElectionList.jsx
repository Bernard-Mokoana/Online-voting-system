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
    const fetchElections = async () => {
      try {
        // Removed '/api' prefix, used relative path
        const endpoint = type === "active" ? "/elections/active" : "/elections";
        const response = await axios.get(endpoint);
        // Ensure we handle the response structure correctly
        setElections(response.data.data || response.data);
      } catch (err) {
        setError(`Failed to fetch ${type} elections`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [type]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );

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
          <Grid item xs={12} md={6} lg={4} key={election.electionId}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {election.electionName}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {election.description}
                </Typography>
                <Typography variant="body2">
                  Start: {new Date(election.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  End: {new Date(election.endDate).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/elections/${election.electionId}`)}
                >
                  View Details
                </Button>
                {type === "active" && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => navigate(`/elections/${election.electionId}/vote`)}
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
