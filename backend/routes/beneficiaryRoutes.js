const express = require('express');
const router = express.Router();
const UserManager = require('../firebase/userManager');
const DisasterManager = require('../firebase/disasterManager');
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

// Register a new beneficiary
router.post('/', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { userId, eventId, personalInfo, location } = req.body;

    // Verify the disaster event exists
    const disaster = await DisasterManager.getDisaster(eventId);
    if (!disaster) {
      return res.status(404).json({ error: 'Disaster event not found' });
    }

    // Create the beneficiary document
    const beneficiaryRef = db.collection(COLLECTIONS.BENEFICIARIES).doc();
    const beneficiaryId = beneficiaryRef.id;

    const beneficiaryData = {
      id: beneficiaryId,
      userId: userId,
      eventId: eventId,
      status: 'pending',
      personalInfo: personalInfo || {},
      location: location || null,
      reliefPackage: {
        totalAmount: 0,
        remainingAmount: 0,
        categories: {
          allocated: {},
          spent: {},
          remaining: {}
        }
      },
      distributionHistory: [],
      verificationStatus: 'pending',
      approvedBy: null,
      approvedAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await beneficiaryRef.set(beneficiaryData);

    // Log the action
    await UserManager.logAction(req.user.uid, 'beneficiary_registered', {
      beneficiaryId,
      userId,
      eventId
    });

    res.json({ success: true, beneficiaryId });
  } catch (error) {
    console.error('Error registering beneficiary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve a beneficiary
router.put('/:id/approve', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const beneficiaryRef = db.collection(COLLECTIONS.BENEFICIARIES).doc(req.params.id);
    const doc = await beneficiaryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    const beneficiaryData = doc.data();

    // Update beneficiary status
    await beneficiaryRef.update({
      verificationStatus: 'verified',
      status: 'approved',
      approvedBy: req.user.uid,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log the action
    await UserManager.logAction(req.user.uid, 'beneficiary_approved', {
      beneficiaryId: req.params.id,
      userId: beneficiaryData.userId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error approving beneficiary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get beneficiary by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const beneficiaryRef = db.collection(COLLECTIONS.BENEFICIARIES).doc(req.params.id);
    const doc = await beneficiaryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    const beneficiary = { id: doc.id, ...doc.data() };

    // Only allow beneficiary to view their own record or operators/admins
    if (req.user.uid !== beneficiary.userId && !['admin', 'operator'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.json(beneficiary);
  } catch (error) {
    console.error('Error getting beneficiary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get beneficiaries for an event
router.get('/event/:eventId', verifyToken, async (req, res) => {
  try {
    let query = db.collection(COLLECTIONS.BENEFICIARIES).where('eventId', '==', req.params.eventId);

    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }

    const snapshot = await query.get();

    const beneficiaries = [];
    snapshot.forEach(doc => {
      beneficiaries.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(beneficiaries);
  } catch (error) {
    console.error('Error getting beneficiaries for event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update beneficiary relief package
router.put('/:id/relief-package', verifyToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { amount, categoryLimits } = req.body;
    const beneficiaryRef = db.collection(COLLECTIONS.BENEFICIARIES).doc(req.params.id);
    const doc = await beneficiaryRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    const beneficiaryData = doc.data();

    // Calculate category allocations based on provided limits
    const categoryAllocations = {};
    const totalAmount = amount || 0;

    if (categoryLimits && Object.keys(categoryLimits).length > 0) {
      // If category limits are provided, allocate based on those
      let totalLimit = 0;
      for (const [category, limit] of Object.entries(categoryLimits)) {
        totalLimit += limit;
      }

      for (const [category, limit] of Object.entries(categoryLimits)) {
        const allocation = (limit / totalLimit) * totalAmount;
        categoryAllocations[category] = allocation;
      }
    } else {
      // Default allocation: 40% food, 30% medicine, 30% shelter
      categoryAllocations.food = totalAmount * 0.4;
      categoryAllocations.medicine = totalAmount * 0.3;
      categoryAllocations.shelter = totalAmount * 0.3;
    }

    // Update the beneficiary's relief package
    await beneficiaryRef.update({
      'reliefPackage.totalAmount': totalAmount,
      'reliefPackage.remainingAmount': totalAmount,
      'reliefPackage.categories.allocated': categoryAllocations,
      'reliefPackage.categories.remaining': categoryAllocations,
      'reliefPackage.categories.spent': {},
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log the action
    await UserManager.logAction(req.user.uid, 'beneficiary_relief_package_updated', {
      beneficiaryId: req.params.id,
      amount,
      categoryAllocations
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating beneficiary relief package:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;