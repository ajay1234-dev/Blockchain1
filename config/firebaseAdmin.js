const admin = require("firebase-admin");

// Initialize Firebase Admin only once using singleton pattern
if (!admin.apps.length) {
  // Validate required environment variables
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_PRIVATE_KEY ||
    !process.env.FIREBASE_CLIENT_EMAIL
  ) {
    console.error(
      "Firebase configuration is incomplete. Please check your .env file."
    );
    console.error(
      "Required variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL"
    );
    process.exit(1);
  }

  // Clean up the private key by replacing literal \n with actual newlines
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && typeof privateKey === "string") {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri:
      process.env.FIREBASE_AUTH_URI ||
      "https://accounts.google.com/o/oauth2/auth",
    token_uri:
      process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
      "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com",
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error.message);
    process.exit(1);
  }
}

// Export Firestore and Auth instances
const firestore = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  firestore,
  auth,
};
