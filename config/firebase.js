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
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : null,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com",
    };

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }

    firebaseInitialized = true;
    console.log("Firebase initialized");
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
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
