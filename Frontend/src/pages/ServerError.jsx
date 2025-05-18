import React from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ServerError = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
        <Typography variant="h1" component="h1" gutterBottom>
          500
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Server Error
        </Typography>
        <Typography color="text.secondary" paragraph>
          Something went wrong on our end. Please try again later.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ServerError;
