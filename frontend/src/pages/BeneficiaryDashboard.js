// src/pages/BeneficiaryDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Card, CardContent, Box, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

function BeneficiaryDashboard() {
  const { currentUser } = useAuth();
  const { provider, signer, userAddress, isConnected, balance, refreshBalance } = useWallet();
  const [reliefPackages, setReliefPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [disasters, setDisasters] = useState([]);

  // Mock data for demo purposes
  const mockUser = { uid: 'demo-beneficiary', email: 'beneficiary@example.com' };
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const mockBalance = '0.0';
  
  const mockReliefPackages = [
    { id: '1', eventId: '1', category: 'Food', amount: 50, status: 'received', description: 'Food relief package', issuedDate: new Date() },
    { id: '2', eventId: '1', category: 'Medicine', amount: 30, status: 'pending', description: 'Medicine relief package', issuedDate: new Date() },
    { id: '3', eventId: '2', category: 'Water', amount: 20, status: 'received', description: 'Water relief package', issuedDate: new Date() }
  ];
  
  const mockTransactions = [
    { id: '1', eventId: '1', category: 'Food', amount: 50, status: 'completed', timestamp: new Date(), vendor: 'Relief Supplies Co.' },
    { id: '2', eventId: '1', category: 'Medicine', amount: 30, status: 'pending', timestamp: new Date(), vendor: 'Medical Aid Inc.' },
    { id: '3', eventId: '2', category: 'Water', amount: 20, status: 'completed', timestamp: new Date(), vendor: 'Emergency Shelter LLC' }
  ];
  
  const mockDisasters = [
    { id: '1', name: 'Hurricane Relief', status: 'active', description: 'Hurricane disaster relief efforts' },
    { id: '2', name: 'Earthquake Aid', status: 'active', description: 'Earthquake disaster relief efforts' }
  ];

  // Load data (or use mock data)
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // Fetch relief packages
          const packagesQuery = query(
            collection(db, 'reliefPackages'),
            where('beneficiaryId', '==', currentUser.uid),
            orderBy('issuedDate', 'desc')
          );
          const packagesSnapshot = await getDocs(packagesQuery);
          const packagesList = [];
          packagesSnapshot.forEach((doc) => {
            packagesList.push({ id: doc.id, ...doc.data() });
          });
          setReliefPackages(packagesList);

          // Fetch transactions
          const transactionsQuery = query(
            collection(db, 'transactions'),
            where('beneficiaryId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
          );
          const transactionsSnapshot = await getDocs(transactionsQuery);
          const transactionsList = [];
          transactionsSnapshot.forEach((doc) => {
            transactionsList.push({ id: doc.id, ...doc.data() });
          });
          setTransactions(transactionsList);

          // Fetch disasters
          const disastersQuery = query(collection(db, 'disasters'), where('status', '==', 'active'));
          const disastersSnapshot = await getDocs(disastersQuery);
          const disastersList = [];
          disastersSnapshot.forEach((doc) => {
            disastersList.push({ id: doc.id, ...doc.data() });
          });
          setDisasters(disastersList);
        } catch (error) {
          console.error('Error fetching data:', error);
          // Use mock data if there's an error
          setReliefPackages(mockReliefPackages);
          setTransactions(mockTransactions);
          setDisasters(mockDisasters);
        }
      } else {
        // Use mock data when not logged in
        setReliefPackages(mockReliefPackages);
        setTransactions(mockTransactions);
        setDisasters(mockDisasters);
      }
    };

    fetchData();
  }, [currentUser]);

  // Determine effective user data
  const effectiveUser = currentUser || mockUser;
  const effectiveAddress = userAddress || mockAddress;
  const effectiveBalance = balance || mockBalance;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Beneficiary Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography variant="body2">Email: {effectiveUser?.email || 'demo@example.com'}</Typography>
            <Typography variant="body2">Wallet: {effectiveAddress ? `${effectiveAddress.substring(0, 6)}...${effectiveAddress.substring(effectiveAddress.length - 4)}` : 'Not connected'}</Typography>
            <Typography variant="body2">ERS Balance: {effectiveBalance ? parseFloat(effectiveBalance).toFixed(4) : '0.0000'}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Active Disasters
            </Typography>
            {disasters.length > 0 ? (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {disasters.map((disaster) => (
                  <Paper key={disaster.id} sx={{ p: 1, mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{disaster.name}</strong>: {disaster.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active disasters
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Relief Packages
              </Typography>
              {reliefPackages.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {reliefPackages.map((pkg) => (
                    <Paper key={pkg.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2">{pkg.category}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip label={pkg.status} size="small" color={pkg.status === 'received' ? 'success' : 'warning'} />
                      </Typography>
                      <Typography variant="body2">
                        Amount: ${pkg.amount?.toFixed(2) || 0}
                      </Typography>
                      <Typography variant="body2">
                        Event: {pkg.eventId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Issued: {pkg.issuedDate ? (pkg.issuedDate.toDate ? pkg.issuedDate.toDate().toLocaleDateString() : pkg.issuedDate.toLocaleDateString ? pkg.issuedDate.toLocaleDateString() : 'N/A') : 'N/A'}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No relief packages found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction History
              </Typography>
              {transactions.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {transactions.map((transaction) => (
                    <Paper key={transaction.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2">{transaction.category}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip label={transaction.status} size="small" color={transaction.status === 'completed' ? 'success' : 'warning'} />
                      </Typography>
                      <Typography variant="body2">
                        Amount: ${transaction.amount?.toFixed(2) || 0}
                      </Typography>
                      <Typography variant="body2">
                        Vendor: {transaction.vendor}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Date: {transaction.timestamp ? (transaction.timestamp.toDate ? transaction.timestamp.toDate().toLocaleDateString() : transaction.timestamp.toLocaleDateString ? transaction.timestamp.toLocaleDateString() : 'N/A') : 'N/A'}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No transactions found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default BeneficiaryDashboard;