const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const firestore = admin.firestore();

const setupAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123!"; // Default password if not set
    const adminName = "System Administrator";

    if (!adminEmail) {
      console.error("Error: ADMIN_EMAIL environment variable is not set");
      process.exit(1);
    }

    console.log(`Setting up admin account with email: ${adminEmail}`);

    // Check if admin already exists
    const adminSnapshot = await firestore
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    // We'll create/update the admin account regardless of whether one exists
    // This ensures the correct admin credentials are always in place
    console.log("Ensuring admin account is properly configured...");

    // Check if user with admin email already exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log("User already exists in Firebase Auth");

      // Update the user's password to ensure it matches the environment variable
      await auth.updateUser(userRecord.uid, {
        password: adminPassword,
      });
      console.log("Updated user password in Firebase Auth");
    } catch (authError) {
      // User doesn't exist, create new user
      console.log("Creating new user in Firebase Auth...");
      userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: adminName,
      });
      console.log("User created successfully in Firebase Auth");
    }

    // Create user profile in Firestore if it doesn't exist
    const userDoc = await firestore
      .collection("users")
      .doc(userRecord.uid)
      .get();
    if (!userDoc.exists) {
      await firestore.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: adminEmail,
        name: adminName,
        role: "admin",
        walletAddress: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log("Admin user profile created in Firestore");
    } else {
      // Update existing user's role to admin (in case it was changed)
      await firestore.collection("users").doc(userRecord.uid).update({
        role: "admin",
        updatedAt: new Date().toISOString(),
      });
      console.log("Existing user updated to admin role");
    }

    console.log("Admin setup completed successfully!");
    console.log(`Admin email: ${adminEmail}`);
    console.log(
      `Default password: ${adminPassword} (change after first login)`
    );
  } catch (error) {
    console.error("Error during admin setup:", error);
    process.exit(1);
  }
};

// Run the setup
setupAdmin();
