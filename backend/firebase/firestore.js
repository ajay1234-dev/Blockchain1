const admin = require('./admin');

const db = admin.firestore();

// Firestore collection names
const COLLECTIONS = {
  USERS: 'users',
  DISASTERS: 'disasters',
  VENDORS: 'vendors',
  BENEFICIARIES: 'beneficiaries',
  CATEGORIES: 'categories',
  TRANSACTIONS: 'transactions',
  DONATIONS: 'donations',
  AUDIT_LOGS: 'audit_logs',
};

module.exports = {
  db,
  COLLECTIONS,
};