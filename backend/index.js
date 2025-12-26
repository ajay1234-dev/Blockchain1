require('dotenv').config();
console.log('Environment variables loaded');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET (first 20 chars)' : 'NOT SET');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK
require('./firebase/admin');

// Import routes
const authRoutes = require('./routes/authRoutes');
const disasterRoutes = require('./routes/disasterRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');

// Import Ethereum sync service
const EthereumSync = require('./firebase/ethereumSync');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      firestore: 'connected',
      auth: 'connected',
      ethereumSync: typeof global.ethereumSync !== 'undefined' && global.ethereumSync !== null
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`Emergency Relief Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize Ethereum sync service
  try {
    if (process.env.ETHEREUM_PROVIDER_URL && process.env.STABLECOIN_CONTRACT_ADDRESS && process.env.MANAGER_CONTRACT_ADDRESS) {
      global.ethereumSync = new EthereumSync(
        process.env.ETHEREUM_PROVIDER_URL,
        process.env.STABLECOIN_CONTRACT_ADDRESS,
        process.env.MANAGER_CONTRACT_ADDRESS
      );
      
      await global.ethereumSync.initialize();
      console.log('Ethereum sync service initialized');
      
      // Start listening for real-time events
      global.ethereumSync.startEventListener();
      console.log('Started real-time event listener');
    } else {
      console.log('Ethereum sync not configured (missing environment variables)');
    }
  } catch (error) {
    console.error('Failed to initialize Ethereum sync:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  if (global.ethereumSync) {
    global.ethereumSync.stopEventListener();
  }
  
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;