// src/pages/Home.js
import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Disaster Relief Platform
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        A blockchain-based platform for transparent and efficient disaster
        relief operations
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                For Donors
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Contribute to disaster relief efforts with full transparency and
                accountability.
              </Typography>
              {currentUser ? (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/donor-dashboard"
                >
                  Donor Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                >
                  Login to Donate
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                For Beneficiaries
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Access disaster relief funds securely and efficiently through
                our digital platform.
              </Typography>
              {currentUser ? (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/beneficiary-dashboard"
                >
                  Beneficiary Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                >
                  Login as Beneficiary
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                For Administrators
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage disaster relief operations, beneficiaries, and funds
                distribution.
              </Typography>
              {currentUser ? (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/admin-dashboard"
                >
                  Admin Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/login"
                >
                  Login as Admin
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;
