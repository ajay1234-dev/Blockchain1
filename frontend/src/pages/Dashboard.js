import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useBlockchain } from "../contexts/BlockchainContext";
import { ethers } from "ethers";

function Dashboard() {
  const { currentUser } = useAuth();
  const { stablecoinContract, userAddress } = useBlockchain();
  const [balance, setBalance] = useState(0);
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const fetchUserData = async () => {
      if (stablecoinContract && userAddress) {
        try {
          // Get user balance
          const balanceBN = await stablecoinContract.balanceOf(userAddress);
          const balanceFormatted = ethers.utils.formatUnits(balanceBN, 18);
          setBalance(parseFloat(balanceFormatted).toFixed(2));
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    fetchUserData();
  }, [stablecoinContract, userAddress]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Typography variant="body2">
              Email: {currentUser?.email || "N/A"}
            </Typography>
            <Typography variant="body2">Role: {userRole}</Typography>
            <Typography variant="body2">
              Wallet:{" "}
              {userAddress
                ? `${userAddress.substring(0, 6)}...${userAddress.substring(
                    userAddress.length - 4
                  )}`
                : "Not connected"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Balance
            </Typography>
            <Typography variant="h4" color="primary">
              {balance} ERS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Emergency Relief Stablecoin
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2">View recent transactions</Typography>
            <Typography variant="body2">Update profile</Typography>
            <Typography variant="body2">View emergency events</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Emergency Events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No active events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
