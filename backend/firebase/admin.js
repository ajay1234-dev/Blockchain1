const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Check if we have the required environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      // Create the service account object
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error.message);
      console.error('Please check your Firebase credentials in the .env file');
      console.error('Make sure FIREBASE_PRIVATE_KEY contains actual newlines or properly escaped ones');
      console.error('Error details:', error);
      throw error;
    }
  } else {
    console.error('Missing Firebase credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file');
    process.exit(1);
  }
}

module.exports = admin;