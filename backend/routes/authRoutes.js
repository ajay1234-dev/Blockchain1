const express = require('express');
const router = express.Router();
const UserManager = require('../firebase/userManager');
const { db, COLLECTIONS } = require('../firebase/firestore');
const admin = require('../firebase/admin');

// Verify Firebase ID token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await UserManager.getUserProfile(req.user.uid);
    res.json(profile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, organization, location } = req.body;
    
    const userData = {
      profile: {
        firstName: firstName || '',
        lastName: lastName || '',
        organization: organization || '',
        location: location || {}
      }
    };
    
    const result = await UserManager.createUserProfile(req.user.uid, userData);
    res.json(result);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by Ethereum address
router.get('/user/ethereum/:address', verifyToken, async (req, res) => {
  try {
    const user = await UserManager.getUserByEthereumAddress(req.params.address);
    res.json(user);
  } catch (error) {
    console.error('Error getting user by Ethereum address:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;