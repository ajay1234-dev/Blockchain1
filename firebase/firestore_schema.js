// firebase/firestore_schema.js
const { db } = require("./config");

// Define collection names as constants to avoid hardcoded values
const COLLECTIONS = {
  USERS: "users",
  DISASTERS: "disasters",
  VENDORS: "vendors",
  CATEGORIES: "categories",
  TRANSACTIONS: "transactions",
  BENEFICIARIES: "beneficiaries",
  DONATIONS: "donations",
  AUDIT_LOGS: "audit_logs",
};

// Firestore schema definitions
const SCHEMA = {
  // Users collection
  [COLLECTIONS.USERS]: {
    fields: {
      uid: "string", // Firebase Auth UID
      email: "string",
      displayName: "string",
      role: "string", // 'admin', 'operator', 'donor', 'beneficiary', 'vendor'
      ethereumAddress: "string",
      createdAt: "timestamp",
      updatedAt: "timestamp",
      isActive: "boolean",
      profile: {
        firstName: "string",
        lastName: "string",
        organization: "string", // For donors/vendors
        location: {
          lat: "number",
          lng: "number",
          address: "string",
          city: "string",
          state: "string",
          country: "string",
        },
        verificationStatus: "string", // 'pending', 'verified', 'rejected'
      },
    },
  },

  // Disasters collection
  [COLLECTIONS.DISASTERS]: {
    fields: {
      id: "string",
      name: "string",
      description: "string",
      status: "string", // 'active', 'inactive', 'completed'
      targetFunding: "number",
      currentFunding: "number",
      raisedFunds: "number",
      location: {
        lat: "number",
        lng: "number",
        address: "string",
        city: "string",
        state: "string",
        country: "string",
      },
      category: "string", // 'natural_disaster', 'conflict', 'health_crisis', etc.
      organizer: "string", // UID of event organizer
      startDate: "timestamp",
      endDate: "timestamp",
      createdAt: "timestamp",
      updatedAt: "timestamp",
      metadata: {
        images: "array",
        documents: "array",
        stats: {
          beneficiariesCount: "number",
          fundsDistributed: "number",
          vendorsActive: "number",
        },
      },
    },
  },

  // Vendors collection
  [COLLECTIONS.VENDORS]: {
    fields: {
      id: "string",
      userId: "string", // Reference to users collection
      ethereumAddress: "string",
      businessName: "string",
      businessType: "string", // 'grocery', 'pharmacy', 'construction', etc.
      licenseInfo: {
        licenseNumber: "string",
        issueDate: "timestamp",
        expiryDate: "timestamp",
      },
      location: {
        lat: "number",
        lng: "number",
        address: "string",
        city: "string",
        state: "string",
        country: "string",
      },
      services: "array", // Categories of services provided
      verificationStatus: "string", // 'pending', 'verified', 'rejected'
      rating: "number", // Average rating (0-5)
      totalTransactions: "number",
      whitelisted: "boolean",
      approvedBy: "string", // UID of admin who approved
      approvedAt: "timestamp",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // Categories collection
  [COLLECTIONS.CATEGORIES]: {
    fields: {
      id: "string",
      name: "string", // 'food', 'medicine', 'shelter', 'water', 'clothing'
      description: "string",
      icon: "string", // URL to category icon
      color: "string", // Color code for UI
      defaultLimit: "number", // Default spending limit
      isActive: "boolean",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // Transactions collection
  [COLLECTIONS.TRANSACTIONS]: {
    fields: {
      id: "string",
      type: "string", // 'donation', 'distribution', 'spending', 'refund'
      from: {
        type: "string", // 'donor', 'contract', 'beneficiary'
        id: "string", // UID or address of sender
      },
      to: {
        type: "string", // 'beneficiary', 'vendor', 'contract'
        id: "string", // UID or address of recipient
      },
      amount: "number",
      amountUSD: "number",
      category: "string",
      eventId: "string",
      description: "string",
      ethereumTxHash: "string",
      status: "string", // 'pending', 'completed', 'failed', 'refunded'
      timestamp: "timestamp",
      metadata: {
        proofOfPurchase: "string",
        vendorSignature: "string",
        beneficiarySignature: "string",
      },
      createdBy: "string",
    },
  },

  // Beneficiaries collection
  [COLLECTIONS.BENEFICIARIES]: {
    fields: {
      id: "string",
      userId: "string",
      ethereumAddress: "string",
      eventId: "string",
      status: "string", // 'registered', 'approved', 'active', 'inactive'
      personalInfo: {
        firstName: "string",
        lastName: "string",
        age: "number",
        gender: "string",
        familySize: "number",
        specialNeeds: "string",
      },
      location: {
        lat: "number",
        lng: "number",
        address: "string",
        city: "string",
        state: "string",
        country: "string",
      },
      reliefPackage: {
        totalAmount: "number",
        remainingAmount: "number",
        categories: {
          allocated: "object", // { food: 100, medicine: 50, ... }
          spent: "object", // { food: 50, medicine: 20, ... }
          remaining: "object", // { food: 50, medicine: 30, ... }
        },
      },
      distributionHistory: "array",
      verificationStatus: "string",
      approvedBy: "string",
      approvedAt: "timestamp",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // Donations collection
  [COLLECTIONS.DONATIONS]: {
    fields: {
      id: "string",
      donorId: "string",
      ethereumAddress: "string",
      amount: "number",
      amountERS: "number",
      currency: "string", // 'ETH', 'USD', 'other ERC20'
      eventId: "string",
      anonymous: "boolean",
      message: "string",
      ethereumTxHash: "string",
      status: "string", // 'pending', 'completed', 'failed'
      timestamp: "timestamp",
      metadata: {
        paymentMethod: "string",
        receiptUrl: "string",
      },
    },
  },

  // Audit logs collection
  [COLLECTIONS.AUDIT_LOGS]: {
    fields: {
      id: "string",
      action: "string", // 'user_registration', 'fund_distribution', 'vendor_approval', etc.
      actor: {
        type: "string", // 'user', 'system', 'contract'
        id: "string",
      },
      target: {
        collection: "string",
        documentId: "string",
      },
      details: "object", // Action-specific details
      ethereumTxHash: "string",
      ipAddress: "string",
      timestamp: "timestamp",
      severity: "string", // 'info', 'warning', 'critical'
    },
  },
};

module.exports = {
  COLLECTIONS,
  SCHEMA,
};
