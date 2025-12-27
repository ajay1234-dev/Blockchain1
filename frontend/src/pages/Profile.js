// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Card, CardContent, Button, TextField, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function Profile() {
  const { currentUser, updateUserProfile } = useAuth();
  const { provider, signer, userAddress, isConnected, balance, refreshBalance } = useWallet();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'donor'
  });

  // Mock data for demo purposes
  const mockProfile = {
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+1-555-0123',
    address: '123 Demo Street, Demo City, DC 12345',
    role: 'donor',
    uid: 'demo-user',
    createdAt: new Date()
  };

  // Load profile data (or use mock data)
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile(userData);
            setFormData({
              name: userData.name || '',
              email: userData.email || currentUser.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              role: userData.role || 'donor'
            });
          } else {
            // User profile doesn't exist, use default values
            setProfile({});
            setFormData({
              name: '',
              email: currentUser.email || '',
              phone: '',
              address: '',
              role: 'donor'
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // Use mock data if there's an error
          setProfile(mockProfile);
          setFormData({
            name: mockProfile.name,
            email: mockProfile.email,
            phone: mockProfile.phone,
            address: mockProfile.address,
            role: mockProfile.role
          });
        }
      } else {
        // Use mock data when not logged in
        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          phone: mockProfile.phone,
          address: mockProfile.address,
          role: mockProfile.role
        });
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentUser) {
        // Update Firestore profile
        await updateDoc(doc(db, 'users', currentUser.uid), {
          ...formData,
          updatedAt: new Date()
        });

        // Update Firebase Auth email if changed
        if (formData.email !== currentUser.email) {
          await updateUserProfile({ email: formData.email });
        }

        alert('Profile updated successfully!');
      } else {
        // In demo mode, update the local state to reflect changes
        setProfile({
          ...mockProfile,
          ...formData,
          updatedAt: new Date()
        });
        setFormData({
          ...formData,
          updatedAt: new Date()
        });
        alert('Demo mode: Profile updated locally');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine effective profile data
  const effectiveProfile = currentUser ? profile : mockProfile;
  const effectiveAddress = userAddress || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const effectiveBalance = balance || '0.0000';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography variant="body2">Email: {effectiveProfile?.email || formData.email}</Typography>
            <Typography variant="body2">Wallet: {effectiveAddress ? `${effectiveAddress.substring(0, 6)}...${effectiveAddress.substring(effectiveAddress.length - 4)}` : 'Not connected'}</Typography>
            <Typography variant="body2">ERS Balance: {effectiveBalance ? parseFloat(effectiveBalance).toFixed(4) : '0.0000'}</Typography>
            <Typography variant="body2">Role: {effectiveProfile?.role || formData.role}</Typography>
            <Typography variant="body2">Member since: {effectiveProfile?.createdAt ? (effectiveProfile.createdAt.toDate ? effectiveProfile.createdAt.toDate().toLocaleDateString() : effectiveProfile.createdAt.toLocaleDateString ? effectiveProfile.createdAt.toLocaleDateString() : 'N/A') : 'N/A'}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Profile
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
                
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
                
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
                
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                />
                
                <TextField
                  label="Role"
                  name="role"
                  select
                  value={formData.role}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="donor">Donor</option>
                  <option value="admin">Admin</option>
                  <option value="operator">Operator</option>
                  <option value="beneficiary">Beneficiary</option>
                  <option value="vendor">Vendor</option>
                </TextField>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;