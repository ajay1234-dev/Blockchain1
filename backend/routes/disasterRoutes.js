const express = require('express');
const router = express.Router();
const DisasterManager = require('../firebase/disasterManager');
const UserManager = require('../firebase/userManager');
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

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    const validation = await UserManager.validateUserRole(req.user.uid, allowedRoles);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    next();
  };
};

// Create a new disaster event
router.post('/', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const result = await DisasterManager.createDisaster(req.body, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('Error creating disaster:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all active disasters
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const disasters = await DisasterManager.getActiveDisasters(limit);
    res.json(disasters);
  } catch (error) {
    console.error('Error getting disasters:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get disaster by ID
router.get('/:id', async (req, res) => {
  try {
    const disaster = await DisasterManager.getDisaster(req.params.id);
    if (!disaster) {
      return res.status(404).json({ error: 'Disaster not found' });
    }
    res.json(disaster);
  } catch (error) {
    console.error('Error getting disaster:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update disaster
router.put('/:id', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const result = await DisasterManager.updateDisaster(req.params.id, req.body, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('Error updating disaster:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deactivate disaster
router.delete('/:id', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const result = await DisasterManager.deactivateDisaster(req.params.id, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('Error deactivating disaster:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;