const express = require('express');
const router = express.Router();
const VendorManager = require('../firebase/vendorManager');
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

// Register a new vendor
router.post('/', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const result = await VendorManager.registerVendor(req.body, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('Error registering vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve a vendor
router.put('/:id/approve', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const result = await VendorManager.approveVendor(req.params.id, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get vendor by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const vendor = await VendorManager.getVendor(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error getting vendor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get whitelisted vendors by service category
router.get('/services/:service', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const vendors = await VendorManager.getWhitelistedVendorsByService(req.params.service, limit);
    res.json(vendors);
  } catch (error) {
    console.error('Error getting whitelisted vendors by service:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get vendors by verification status
router.get('/status/:status', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const vendors = await VendorManager.getVendorsByStatus(req.params.status, limit);
    res.json(vendors);
  } catch (error) {
    console.error('Error getting vendors by status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update vendor whitelist status
router.put('/:id/whitelist', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { whitelisted } = req.body;
    const result = await VendorManager.updateVendorWhitelistStatus(req.params.id, whitelisted, req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('Error updating vendor whitelist status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;