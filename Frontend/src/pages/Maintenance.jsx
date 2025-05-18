import React from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";

const Maintenance = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
        <ConstructionIcon sx={{ fontSize: 80, color: "warning.main", mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Under Maintenance
        </Typography>
        <Typography color="text.secondary" paragraph>
          We are currently performing scheduled maintenance. Please check back
          later.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Expected completion time: 2 hours
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Maintenance;
