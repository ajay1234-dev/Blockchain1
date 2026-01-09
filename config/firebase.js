const admin = require("firebase-admin");

let firebaseInitialized = false;

function initializeApp() {
  // Check if required environment variables are set
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn(
      "Firebase configuration is incomplete. Running in development mode without Firebase."
    );
    firebaseInitialized = false;
    return;
  }

  try {
    // Clean up the private key by replacing literal \n with actual newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey && typeof privateKey === 'string') {
      // Handle different possible encodings
      privateKey = privateKey.replace(/\\n/g, "\n");
      // Also handle cases where there might be URL encoding
      if (privateKey.includes('%')) {
        privateKey = decodeURIComponent(privateKey);
      }
    }

    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com",
    };

    // Validate the service account object
    if (!serviceAccount.private_key) {
      throw new Error('Private key is missing or invalid');
    }

    if (!serviceAccount.client_email) {
      throw new Error('Client email is missing');
    }

    if (!serviceAccount.project_id) {
      throw new Error('Project ID is missing');
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }

    firebaseInitialized = true;
    console.log("Firebase initialized");
  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    console.error("Error code:", error.code);
    // Provide more specific guidance based on error type
    if (error.message.includes('invalid_grant') || error.message.includes('JWT Signature')) {
      console.error("\n=== FIREBASE CONFIGURATION ISSUE ===");
      console.error("The Firebase service account key appears to be invalid.");
      console.error("Possible causes and solutions:");
      console.error("1. The service account key has been revoked - regenerate the key");
      console.error("2. The system time is not synchronized - sync your system time");
      console.error("3. The private key is malformed - copy the key correctly");
      console.error("\nTo fix this issue:");
      console.error("1. Go to Firebase Console > Project Settings > Service Accounts");
      console.error("2. Generate a new private key and download the JSON file");
      console.error("3. Copy the values from the JSON file to your .env file");
      console.error("===================================\n");
    }
    firebaseInitialized = false;
  }
}

module.exports = {
  initializeApp,
  getFirestore: () => {
    if (firebaseInitialized && admin.apps.length > 0) {
      return admin.firestore();
    }
    console.warn("Firebase not initialized, returning mock object");
    return {
      collection: () => ({
        get: () => ({ docs: [], forEach: () => {} }),
        add: () =>
          Promise.resolve({ id: "mock-id", delete: () => Promise.resolve() }),
        doc: () => ({
          get: () => ({ exists: false }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
        }),
        where: () => ({
          get: () => ({ docs: [], forEach: () => {} }),
        }),
      }),
    };
  },
  getAuth: () => {
    if (firebaseInitialized && admin.apps.length > 0) {
      return admin.auth();
    }
    console.warn("Firebase not initialized, returning mock object");
    return {
      verifyIdToken: () => Promise.resolve({ uid: "mock-uid" }),
      getUserByEmail: () => Promise.reject(new Error("User not found")),
      createUser: () =>
        Promise.resolve({
          uid: "mock-uid",
          email: "mock@example.com",
          displayName: "Mock User",
        }),
      createCustomToken: () => Promise.resolve("mock-token"),
    };
  },
};
