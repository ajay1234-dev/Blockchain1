// src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ethers } from "ethers";

function AdminDashboard() {
  const { currentUser } = useAuth();
  const { provider, signer, userAddress, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState(0);
  const [disasters, setDisasters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newDisaster, setNewDisaster] = useState({
    name: "",
    description: "",
    targetFunding: "",
  });
  const [loading, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load disasters
        const disastersSnapshot = await getDocs(collection(db, "disasters"));
        const disastersList = [];
        disastersSnapshot.forEach((doc) => {
          disastersList.push({ id: doc.id, ...doc.data() });
        });
        setDisasters(disastersList);

        // Load vendors
        const vendorsSnapshot = await getDocs(collection(db, "vendors"));
        const vendorsList = [];
        vendorsSnapshot.forEach((doc) => {
          vendorsList.push({ id: doc.id, ...doc.data() });
        });
        setVendors(vendorsList);

        // Load beneficiaries
        const beneficiariesSnapshot = await getDocs(
          collection(db, "beneficiaries")
        );
        const beneficiariesList = [];
        beneficiariesSnapshot.forEach((doc) => {
          beneficiariesList.push({ id: doc.id, ...doc.data() });
        });
        setBeneficiaries(beneficiariesList);

        // Load transactions
        const transactionsSnapshot = await getDocs(
          collection(db, "transactions")
        );
        const transactionsList = [];
        transactionsSnapshot.forEach((doc) => {
          transactionsList.push({ id: doc.id, ...doc.data() });
        });
        setTransactions(transactionsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleCreateDisaster = async () => {
    if (
      !newDisaster.name ||
      !newDisaster.description ||
      !newDisaster.targetFunding
    ) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const disasterData = {
        name: newDisaster.name,
        description: newDisaster.description,
        status: "active",
        targetFunding: parseFloat(newDisaster.targetFunding),
        currentFunding: 0,
        raisedFunds: 0,
        organizer: currentUser.uid,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          stats: {
            beneficiariesCount: 0,
            fundsDistributed: 0,
            vendorsActive: 0,
          },
        },
      };

      await addDoc(collection(db, "disasters"), disasterData);

      // Refresh disasters list
      const disastersSnapshot = await getDocs(collection(db, "disasters"));
      const disastersList = [];
      disastersSnapshot.forEach((doc) => {
        disastersList.push({ id: doc.id, ...doc.data() });
      });
      setDisasters(disastersList);

      // Reset form
      setNewDisaster({ name: "", description: "", targetFunding: "" });

      alert("Disaster created successfully!");
    } catch (error) {
      console.error("Error creating disaster:", error);
      alert("Error creating disaster: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      await updateDoc(vendorRef, {
        verificationStatus: "verified",
        whitelisted: true,
        approvedBy: currentUser.uid,
        approvedAt: new Date(),
        updatedAt: new Date(),
      });

      // Refresh vendors list
      const vendorsSnapshot = await getDocs(collection(db, "vendors"));
      const vendorsList = [];
      vendorsSnapshot.forEach((doc) => {
        vendorsList.push({ id: doc.id, ...doc.data() });
      });
      setVendors(vendorsList);

      alert("Vendor approved successfully!");
    } catch (error) {
      console.error("Error approving vendor:", error);
      alert("Error approving vendor: " + error.message);
    }
  };

  const handleApproveBeneficiary = async (beneficiaryId) => {
    try {
      const beneficiaryRef = doc(db, "beneficiaries", beneficiaryId);
      await updateDoc(beneficiaryRef, {
        verificationStatus: "verified",
        status: "approved",
        approvedBy: currentUser.uid,
        approvedAt: new Date(),
        updatedAt: new Date(),
      });

      // Refresh beneficiaries list
      const beneficiariesSnapshot = await getDocs(
        collection(db, "beneficiaries")
      );
      const beneficiariesList = [];
      beneficiariesSnapshot.forEach((doc) => {
        beneficiariesList.push({ id: doc.id, ...doc.data() });
      });
      setBeneficiaries(beneficiariesList);

      alert("Beneficiary approved successfully!");
    } catch (error) {
      console.error("Error approving beneficiary:", error);
      alert("Error approving beneficiary: " + error.message);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Disasters" />
          <Tab label="Vendors" />
          <Tab label="Beneficiaries" />
          <Tab label="Transactions" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Create New Disaster
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Disaster Name"
                  value={newDisaster.name}
                  onChange={(e) =>
                    setNewDisaster({ ...newDisaster, name: e.target.value })
                  }
                />
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  value={newDisaster.description}
                  onChange={(e) =>
                    setNewDisaster({
                      ...newDisaster,
                      description: e.target.value,
                    })
                  }
                />
                <TextField
                  label="Target Funding (USD)"
                  type="number"
                  value={newDisaster.targetFunding}
                  onChange={(e) =>
                    setNewDisaster({
                      ...newDisaster,
                      targetFunding: e.target.value,
                    })
                  }
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateDisaster}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Disaster"}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Active Disasters
              </Typography>
              {disasters.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {disasters.map((disaster) => (
                    <Paper key={disaster.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{disaster.name}</strong>
                        <br />
                        {disaster.description}
                        <br />
                        Status: {disaster.status} | Funding: $
                        {disaster.currentFunding?.toFixed(2) || 0} / $
                        {disaster.targetFunding?.toFixed(2) || 0}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No disasters found
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Pending Vendors
              </Typography>
              {vendors.filter((v) => v.verificationStatus === "pending")
                .length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {vendors
                    .filter((v) => v.verificationStatus === "pending")
                    .map((vendor) => (
                      <Paper
                        key={vendor.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body2">
                            <strong>{vendor.businessName}</strong>
                            <br />
                            Business Type: {vendor.businessType || "N/A"}
                            <br />
                            Services: {vendor.services?.join(", ") || "N/A"}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleApproveVendor(vendor.id)}
                        >
                          Approve
                        </Button>
                      </Paper>
                    ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending vendors
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Pending Beneficiaries
              </Typography>
              {beneficiaries.filter((b) => b.verificationStatus === "pending")
                .length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {beneficiaries
                    .filter((b) => b.verificationStatus === "pending")
                    .map((beneficiary) => (
                      <Paper
                        key={beneficiary.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body2">
                            <strong>
                              {beneficiary.personalInfo?.firstName}{" "}
                              {beneficiary.personalInfo?.lastName}
                            </strong>
                            <br />
                            Location: {beneficiary.location?.city ||
                              "N/A"}, {beneficiary.location?.state || "N/A"}
                            <br />
                            Special Needs:{" "}
                            {beneficiary.personalInfo?.specialNeeds || "None"}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleApproveBeneficiary(beneficiary.id)
                          }
                        >
                          Approve
                        </Button>
                      </Paper>
                    ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending beneficiaries
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {transactions.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  {transactions.slice(0, 20).map((transaction) => (
                    <Paper key={transaction.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Type:</strong> {transaction.type} |
                        <strong> Amount:</strong> {transaction.amount} |
                        <strong> Category:</strong>{" "}
                        {transaction.category || "N/A"} |<strong> Date:</strong>{" "}
                        {transaction.timestamp?.toDate
                          ? transaction.timestamp.toDate().toLocaleDateString()
                          : "N/A"}
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
      )}
    </Container>
  );
}

export default AdminDashboard;
