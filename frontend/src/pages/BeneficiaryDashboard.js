// src/pages/BeneficiaryDashboard.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { db } from "../config/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { ethers } from "ethers";

function BeneficiaryDashboard() {
  const { currentUser } = useAuth();
  const {
    provider,
    signer,
    userAddress,
    isConnected,
    balance,
    refreshBalance,
  } = useWallet();
  const [beneficiaryInfo, setBeneficiaryInfo] = useState(null);
  const [reliefPackages, setReliefPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [spendingAmount, setSpendingAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Load beneficiary information
  useEffect(() => {
    const fetchBeneficiaryInfo = async () => {
      if (currentUser) {
        try {
          const q = query(
            collection(db, "beneficiaries"),
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setBeneficiaryInfo({ id: doc.id, ...doc.data() });
          }
        } catch (error) {
          console.error("Error fetching beneficiary info:", error);
        }
      }
    };

    fetchBeneficiaryInfo();
  }, [currentUser]);

  // Load relief packages
  useEffect(() => {
    const fetchReliefPackages = async () => {
      if (beneficiaryInfo) {
        try {
          // In a real implementation, this would come from the smart contract
          // For now, we'll use the data from Firestore
          setReliefPackages([
            {
              id: "food",
              name: "Food",
              allocated:
                beneficiaryInfo.reliefPackage?.categories?.allocated?.food || 0,
              spent:
                beneficiaryInfo.reliefPackage?.categories?.spent?.food || 0,
              remaining:
                beneficiaryInfo.reliefPackage?.categories?.remaining?.food || 0,
            },
            {
              id: "medicine",
              name: "Medicine",
              allocated:
                beneficiaryInfo.reliefPackage?.categories?.allocated
                  ?.medicine || 0,
              spent:
                beneficiaryInfo.reliefPackage?.categories?.spent?.medicine || 0,
              remaining:
                beneficiaryInfo.reliefPackage?.categories?.remaining
                  ?.medicine || 0,
            },
            {
              id: "shelter",
              name: "Shelter",
              allocated:
                beneficiaryInfo.reliefPackage?.categories?.allocated?.shelter ||
                0,
              spent:
                beneficiaryInfo.reliefPackage?.categories?.spent?.shelter || 0,
              remaining:
                beneficiaryInfo.reliefPackage?.categories?.remaining?.shelter ||
                0,
            },
          ]);
        } catch (error) {
          console.error("Error fetching relief packages:", error);
        }
      }
    };

    fetchReliefPackages();
  }, [beneficiaryInfo]);

  // Load transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (currentUser) {
        try {
          const q = query(
            collection(db, "transactions"),
            where("to.id", "==", currentUser.uid),
            orderBy("timestamp", "desc")
          );
          const querySnapshot = await getDocs(q);
          const transactionsList = [];
          querySnapshot.forEach((doc) => {
            transactionsList.push({ id: doc.id, ...doc.data() });
          });
          setTransactions(transactionsList);
        } catch (error) {
          console.error("Error fetching transactions:", error);
        }
      }
    };

    fetchTransactions();
  }, [currentUser]);

  // Load vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const q = query(
          collection(db, "vendors"),
          where("whitelisted", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const vendorsList = [];
        querySnapshot.forEach((doc) => {
          vendorsList.push({ id: doc.id, ...doc.data() });
        });
        setVendors(vendorsList);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  const handleSpend = async () => {
    if (!selectedVendor || !selectedCategory || !spendingAmount) {
      alert("Please select a vendor, category, and enter an amount");
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, this would interact with the smart contract
      // For now, we'll just simulate the transaction
      console.log(
        `Spending ${spendingAmount} on ${selectedCategory} from ${selectedVendor}`
      );

      // Find the category in relief packages
      const category = reliefPackages.find(
        (pkg) => pkg.id === selectedCategory
      );
      if (!category || category.remaining < parseFloat(spendingAmount)) {
        alert("Insufficient funds in selected category");
        setLoading(false);
        return;
      }

      // Simulate the spending operation
      // In a real implementation, this would call the smart contract's spendInCategory function
      alert(
        `Spending ${spendingAmount} ${selectedCategory} tokens at ${selectedVendor} simulated successfully!`
      );

      // Reset form
      setSelectedVendor("");
      setSelectedCategory("");
      setSpendingAmount("");

      // Refresh wallet balance
      if (refreshBalance) {
        refreshBalance();
      }
    } catch (error) {
      console.error("Error processing spending:", error);
      alert("Error processing spending: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Beneficiary Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography variant="body2">
              Email: {currentUser?.email || "N/A"}
            </Typography>
            <Typography variant="body2">
              Wallet:{" "}
              {userAddress
                ? `${userAddress.substring(0, 6)}...${userAddress.substring(
                    userAddress.length - 4
                  )}`
                : "Not connected"}
            </Typography>
            <Typography variant="body2">
              ETH Balance: {balance ? parseFloat(balance).toFixed(4) : "0.0000"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Relief Package Information
            </Typography>
            {beneficiaryInfo ? (
              <Box>
                <Typography variant="body2">
                  <strong>Status:</strong> {beneficiaryInfo.status || "N/A"}
                  <br />
                  <strong>Verification:</strong>{" "}
                  {beneficiaryInfo.verificationStatus || "N/A"}
                  <br />
                  <strong>Total Allocated:</strong>{" "}
                  {beneficiaryInfo.reliefPackage?.totalAmount?.toFixed(2) || 0}{" "}
                  ERS
                  <br />
                  <strong>Remaining:</strong>{" "}
                  {beneficiaryInfo.reliefPackage?.remainingAmount?.toFixed(2) ||
                    0}{" "}
                  ERS
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No relief package information available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Relief Package by Category
            </Typography>
            {reliefPackages.length > 0 ? (
              <List>
                {reliefPackages.map((pkg) => (
                  <ListItem key={pkg.id} divider>
                    <ListItemText
                      primary={pkg.name}
                      secondary={`Allocated: ${pkg.allocated.toFixed(
                        2
                      )} | Spent: ${pkg.spent.toFixed(
                        2
                      )} | Remaining: ${pkg.remaining.toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No relief package data available
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Spend Relief Tokens
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.businessName} ({vendor.businessType})
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select a category</option>
                {reliefPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} (Remaining: {pkg.remaining.toFixed(2)})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Amount to spend"
                value={spendingAmount}
                onChange={(e) => setSpendingAmount(e.target.value)}
                min="0"
                step="0.01"
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={handleSpend}
                disabled={
                  loading ||
                  !selectedVendor ||
                  !selectedCategory ||
                  !spendingAmount
                }
              >
                {loading ? "Processing..." : "Spend Tokens"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            {transactions.length > 0 ? (
              <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                {transactions.map((transaction) => (
                  <Paper key={transaction.id} sx={{ p: 2, mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Type:</strong> {transaction.type} |
                      <strong> Amount:</strong> {transaction.amount} |
                      <strong> Category:</strong>{" "}
                      {transaction.category || "N/A"} |<strong> Date:</strong>{" "}
                      {transaction.timestamp?.toDate
                        ? transaction.timestamp.toDate().toLocaleDateString()
                        : "N/A"}{" "}
                      |<strong> Description:</strong> {transaction.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No transactions found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BeneficiaryDashboard;
