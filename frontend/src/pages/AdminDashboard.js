// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Card, CardContent, Button, Box, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, updateDoc, doc, where } from 'firebase/firestore';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [disasters, setDisasters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [stats, setStats] = useState({ totalDonations: 0, totalDisasters: 0, activeDisasters: 0 });

  // Mock data for demo purposes
  const mockDisasters = [
    { id: '1', name: 'Hurricane Relief', status: 'active', currentFunding: 50000, targetFunding: 100000, description: 'Hurricane disaster relief efforts', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Earthquake Aid', status: 'active', currentFunding: 25000, targetFunding: 50000, description: 'Earthquake disaster relief efforts', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Flood Support', status: 'closed', currentFunding: 15000, targetFunding: 30000, description: 'Flood disaster relief efforts', createdAt: new Date(), updatedAt: new Date() }
  ];
  
  const mockVendors = [
    { id: '1', name: 'Relief Supplies Co.', email: 'contact@reliefsupplies.com', status: 'approved', businessType: 'Supplies', rating: 4.5, registrationDate: new Date() },
    { id: '2', name: 'Medical Aid Inc.', email: 'info@medicalaid.com', status: 'pending', businessType: 'Medical', rating: 0, registrationDate: new Date() },
    { id: '3', name: 'Emergency Shelter LLC', email: 'admin@emergencyshelter.com', status: 'rejected', businessType: 'Shelter', rating: 0, registrationDate: new Date() }
  ];
  
  const mockBeneficiaries = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'approved', disasterId: '1', registrationDate: new Date() },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'pending', disasterId: '1', registrationDate: new Date() },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'approved', disasterId: '2', registrationDate: new Date() }
  ];

  // Load data (or use mock data)
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // Fetch disasters
          const disastersQuery = query(collection(db, 'disasters'), orderBy('createdAt', 'desc'));
          const disastersSnapshot = await getDocs(disastersQuery);
          const disastersList = [];
          disastersSnapshot.forEach((doc) => {
            disastersList.push({ id: doc.id, ...doc.data() });
          });
          setDisasters(disastersList);

          // Fetch vendors
          const vendorsQuery = query(collection(db, 'vendors'), orderBy('registrationDate', 'desc'));
          const vendorsSnapshot = await getDocs(vendorsQuery);
          const vendorsList = [];
          vendorsSnapshot.forEach((doc) => {
            vendorsList.push({ id: doc.id, ...doc.data() });
          });
          setVendors(vendorsList);

          // Fetch beneficiaries
          const beneficiariesQuery = query(collection(db, 'beneficiaries'), orderBy('registrationDate', 'desc'));
          const beneficiariesSnapshot = await getDocs(beneficiariesQuery);
          const beneficiariesList = [];
          beneficiariesSnapshot.forEach((doc) => {
            beneficiariesList.push({ id: doc.id, ...doc.data() });
          });
          setBeneficiaries(beneficiariesList);

          // Calculate stats
          const totalDonations = disastersList.reduce((sum, disaster) => sum + disaster.currentFunding, 0);
          const totalDisasters = disastersList.length;
          const activeDisasters = disastersList.filter(d => d.status === 'active').length;
          setStats({ totalDonations, totalDisasters, activeDisasters });
        } catch (error) {
          console.error('Error fetching data:', error);
          // Use mock data if there's an error
          setDisasters(mockDisasters);
          setVendors(mockVendors);
          setBeneficiaries(mockBeneficiaries);
          setStats({ 
            totalDonations: mockDisasters.reduce((sum, disaster) => sum + disaster.currentFunding, 0), 
            totalDisasters: mockDisasters.length, 
            activeDisasters: mockDisasters.filter(d => d.status === 'active').length 
          });
        }
      } else {
        // Use mock data when not logged in
        setDisasters(mockDisasters);
        setVendors(mockVendors);
        setBeneficiaries(mockBeneficiaries);
        setStats({ 
          totalDonations: mockDisasters.reduce((sum, disaster) => sum + disaster.currentFunding, 0), 
          totalDisasters: mockDisasters.length, 
          activeDisasters: mockDisasters.filter(d => d.status === 'active').length 
        });
      }
    };

    fetchData();
  }, [currentUser]);

  const updateVendorStatus = async (vendorId, newStatus) => {
    if (currentUser) {
      try {
        const vendorRef = doc(db, 'vendors', vendorId);
        await updateDoc(vendorRef, { status: newStatus });
        
        // Refresh vendors list
        const vendorsQuery = query(collection(db, 'vendors'), orderBy('registrationDate', 'desc'));
        const vendorsSnapshot = await getDocs(vendorsQuery);
        const vendorsList = [];
        vendorsSnapshot.forEach((doc) => {
          vendorsList.push({ id: doc.id, ...doc.data() });
        });
        setVendors(vendorsList);
      } catch (error) {
        console.error('Error updating vendor status:', error);
        alert('Error updating vendor status: ' + error.message);
      }
    } else {
      alert('Demo mode: Vendor status would be updated in a real application');
      // In demo mode, we'll just update the local state
      setVendors(vendors.map(vendor => 
        vendor.id === vendorId ? { ...vendor, status: newStatus } : vendor
      ));
    }
  };

  const updateBeneficiaryStatus = async (beneficiaryId, newStatus) => {
    if (currentUser) {
      try {
        const beneficiaryRef = doc(db, 'beneficiaries', beneficiaryId);
        await updateDoc(beneficiaryRef, { status: newStatus });
        
        // Refresh beneficiaries list
        const beneficiariesQuery = query(collection(db, 'beneficiaries'), orderBy('registrationDate', 'desc'));
        const beneficiariesSnapshot = await getDocs(beneficiariesQuery);
        const beneficiariesList = [];
        beneficiariesSnapshot.forEach((doc) => {
          beneficiariesList.push({ id: doc.id, ...doc.data() });
        });
        setBeneficiaries(beneficiariesList);
      } catch (error) {
        console.error('Error updating beneficiary status:', error);
        alert('Error updating beneficiary status: ' + error.message);
      }
    } else {
      alert('Demo mode: Beneficiary status would be updated in a real application');
      // In demo mode, we'll just update the local state
      setBeneficiaries(beneficiaries.map(beneficiary => 
        beneficiary.id === beneficiaryId ? { ...beneficiary, status: newStatus } : beneficiary
      ));
    }
  };

  // Helper function to format dates properly
  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      // Firebase Timestamp
      return date.toDate().toLocaleDateString();
    } else if (date instanceof Date) {
      // Regular Date object
      return date.toLocaleDateString();
    } else if (typeof date === 'string') {
      // Date string
      return new Date(date).toLocaleDateString();
    }
    return 'N/A';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Total Donations</Typography>
            <Typography variant="h4" color="primary">${stats.totalDonations.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Total Disasters</Typography>
            <Typography variant="h4" color="primary">{stats.totalDisasters}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Active Disasters</Typography>
            <Typography variant="h4" color="primary">{stats.activeDisasters}</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Disasters
              </Typography>
              {disasters.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {disasters.map((disaster) => (
                    <Paper key={disaster.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2">{disaster.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip label={disaster.status} size="small" color={disaster.status === 'active' ? 'success' : 'default'} />
                      </Typography>
                      <Typography variant="body2">
                        Funding: ${disaster.currentFunding?.toFixed(2) || 0} / ${disaster.targetFunding?.toFixed(2) || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Created: {formatDate(disaster.createdAt)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No disasters found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vendors
              </Typography>
              {vendors.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {vendors.map((vendor) => (
                    <Paper key={vendor.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2">{vendor.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip label={vendor.status} size="small" color={vendor.status === 'approved' ? 'success' : vendor.status === 'pending' ? 'warning' : 'error'} />
                      </Typography>
                      <Typography variant="body2">
                        Type: {vendor.businessType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Registered: {formatDate(vendor.registrationDate)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {vendor.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success"
                              onClick={() => updateVendorStatus(vendor.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No vendors found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Beneficiaries
              </Typography>
              {beneficiaries.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {beneficiaries.map((beneficiary) => (
                    <Paper key={beneficiary.id} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="subtitle2">{beneficiary.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: <Chip label={beneficiary.status} size="small" color={beneficiary.status === 'approved' ? 'success' : 'warning'} />
                      </Typography>
                      <Typography variant="body2">
                        Disaster: {beneficiary.disasterId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Registered: {formatDate(beneficiary.registrationDate)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {beneficiary.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success"
                              onClick={() => updateBeneficiaryStatus(beneficiary.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => updateBeneficiaryStatus(beneficiary.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No beneficiaries found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDashboard;