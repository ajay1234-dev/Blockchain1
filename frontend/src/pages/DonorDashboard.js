// src/pages/DonorDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Card, CardContent, Button, TextField, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { ethers } from 'ethers';

function DonorDashboard() {
  const { currentUser } = useAuth();
  const { provider, signer, userAddress, isConnected, balance, refreshBalance } = useWallet();
  const [donations, setDonations] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for demo purposes
  const mockUser = { uid: 'demo-user', email: 'demo@example.com' };
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const mockBalance = '1.25';
  const mockDonations = [
    { id: '1', eventId: '1', amount: 0.5, timestamp: new Date(), status: 'completed', description: 'Disaster Relief Fund' },
    { id: '2', eventId: '2', amount: 1.0, timestamp: new Date(), status: 'completed', description: 'Emergency Aid' }
  ];
  const mockDisasters = [
    { id: '1', name: 'Hurricane Relief', currentFunding: 50000, targetFunding: 100000, description: 'Hurricane disaster relief efforts' },
    { id: '2', name: 'Earthquake Aid', currentFunding: 25000, targetFunding: 50000, description: 'Earthquake disaster relief efforts' },
    { id: '3', name: 'Flood Support', currentFunding: 15000, targetFunding: 30000, description: 'Flood disaster relief efforts' }
  ];

  // Load user donations (or use mock data)
  useEffect(() => {
    const fetchDonations = async () => {
      if (currentUser) {
        try {
          const q = query(
            collection(db, 'donations'),
            where('donorId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const donationsList = [];
          querySnapshot.forEach((doc) => {
            donationsList.push({ id: doc.id, ...doc.data() });
          });
          setDonations(donationsList);
        } catch (error) {
          console.error('Error fetching donations:', error);
          // Use mock data if there's an error
          setDonations(mockDonations);
        }
      } else {
        // Use mock data when not logged in
        setDonations(mockDonations);
      }
    };

    fetchDonations();
  }, [currentUser]);

  // Load active disasters (or use mock data)
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const q = query(
          collection(db, 'disasters'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const disastersList = [];
        querySnapshot.forEach((doc) => {
          disastersList.push({ id: doc.id, ...doc.data() });
        });
        setDisasters(disastersList);
      } catch (error) {
        console.error('Error fetching disasters:', error);
        // Use mock data if there's an error
        setDisasters(mockDisasters);
      }
    };

    // Use mock data when not logged in
    if (!currentUser) {
      setDisasters(mockDisasters);
    } else {
      fetchDisasters();
    }
  }, [currentUser]);

  const handleDonate = async () => {
    if (!selectedDisaster || !donationAmount) {
      alert('Please select a disaster and enter an amount');
      return;
    }

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      // Convert amount to wei
      const amountInWei = ethers.parseEther(donationAmount.toString());
      
      // Get disaster details
      const disaster = disasters.find(d => d.id === selectedDisaster);
      
      // Create donation record in Firestore
      const donationData = {
        donorId: currentUser ? currentUser.uid : mockUser.uid,
        ethereumAddress: userAddress || mockAddress,
        amount: parseFloat(donationAmount),
        amountERS: parseFloat(donationAmount), // For demo purposes
        currency: 'ETH',
        eventId: selectedDisaster,
        anonymous: false,
        message: 'Direct donation',
        status: 'pending',
        timestamp: new Date(),
        metadata: {
          paymentMethod: 'ETH',
        }
      };

      await addDoc(collection(db, 'donations'), donationData);

      // In a real implementation, you would interact with the smart contract here
      // For now, we'll just simulate the transaction
      console.log(`Donation of ${donationAmount} ETH to disaster ${selectedDisaster}`);

      // Refresh donations list
      const q = query(
        collection(db, 'donations'),
        where('donorId', '==', currentUser ? currentUser.uid : mockUser.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const donationsList = [];
      querySnapshot.forEach((doc) => {
        donationsList.push({ id: doc.id, ...doc.data() });
      });
      setDonations(donationsList);

      // Reset form
      setDonationAmount('');
      setSelectedDisaster('');

      // Refresh wallet balance
      if (refreshBalance) {
        refreshBalance();
      }

      alert('Donation submitted successfully!');
    } catch (error) {
      console.error('Error making donation:', error);
      alert('Error making donation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine effective user data
  const effectiveUser = currentUser || mockUser;
  const effectiveAddress = userAddress || mockAddress;
  const effectiveBalance = balance || mockBalance;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Donor Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography variant="body2">Email: {effectiveUser?.email || 'demo@example.com'}</Typography>
            <Typography variant="body2">Wallet: {effectiveAddress ? `${effectiveAddress.substring(0, 6)}...${effectiveAddress.substring(effectiveAddress.length - 4)}` : 'Not connected'}</Typography>
            <Typography variant="body2">ETH Balance: {effectiveBalance ? parseFloat(effectiveBalance).toFixed(4) : '0.0000'}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Make a Donation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <select
                value={selectedDisaster}
                onChange={(e) => setSelectedDisaster(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select a disaster</option>
                {disasters.map((disaster) => (
                  <option key={disaster.id} value={disaster.id}>
                    {disaster.name} - ${disaster.currentFunding?.toFixed(2) || 0} / ${disaster.targetFunding?.toFixed(2) || 0}
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Donation Amount (ETH)"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                min="0"
                step="0.01"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleDonate}
                disabled={loading || !selectedDisaster || !donationAmount}
              >
                {loading ? 'Processing...' : 'Donate'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Donations
              </Typography>
              {donations.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {donations.map((donation) => (
                    <Paper key={donation.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Disaster:</strong> {donation.eventId} | 
                        <strong> Amount:</strong> {donation.amount} ETH | 
                        <strong> Date:</strong> {donation.timestamp ? (donation.timestamp.toDate ? donation.timestamp.toDate().toLocaleDateString() : donation.timestamp.toLocaleDateString ? donation.timestamp.toLocaleDateString() : 'N/A') : 'N/A'} |
                        <strong> Status:</strong> {donation.status}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No donations found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DonorDashboard;