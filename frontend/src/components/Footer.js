// src/components/Footer.js
import React from "react";
import { Container, Typography, Box } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {"Copyright © "}
          Disaster Relief Platform {new Date().getFullYear()}
          {"."}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          Blockchain-based Disaster Relief Management System
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
