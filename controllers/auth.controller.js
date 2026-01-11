const { firestore, auth } = require("../config/firebaseAdmin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Function to check if Firebase services are available
const checkFirebaseAvailability = async () => {
  try {
    // Test Firestore connectivity by trying to access a simple collection
    await firestore.collection("health-check").limit(1).get();

    // Test Authentication connectivity by verifying the admin SDK is initialized
    if (!auth) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Firebase availability check failed:", error);
    return false;
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, role, walletAddress } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, name, and role are required" });
    }

    // Validate role
    const validRoles = ["admin", "donor", "beneficiary", "vendor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be admin, donor, beneficiary, or vendor",
      });
    }

    // Check if Firebase services are available
    const isFirebaseAvailable = await checkFirebaseAvailability();
    if (!isFirebaseAvailable) {
      return res.status(503).json({
        message:
          "Authentication service temporarily unavailable. Please try again later.",
      });
    }

    // Check if user already exists in Firebase Auth
    try {
      await auth.getUserByEmail(email);
      return res.status(400).json({ message: "User already exists" });
    } catch (error) {
      // User doesn't exist, continue with registration
    }

    // Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (authError) {
      console.error("Firebase Auth error during registration:", authError);
      return res.status(500).json({ message: "Failed to create user account" });
    }

    // Create user profile in Firestore

    // Validate wallet address format if provided
    let validatedWalletAddress = null;
    if (walletAddress) {
      if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
        return res
          .status(400)
          .json({ message: "Invalid wallet address format" });
      }
      validatedWalletAddress = walletAddress;
    }

    try {
      await firestore.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        name,
        role,
        walletAddress: validatedWalletAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (firestoreError) {
      console.error("Firestore error during registration:", firestoreError);
      // If Firestore fails, delete the user from auth to prevent orphaned records
      try {
        await auth.deleteUser(userRecord.uid);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup user after Firestore error:",
          cleanupError
        );
      }
      return res.status(500).json({ message: "Failed to create user profile" });
    }

    // Create a JWT token for the new user
    const token = jwt.sign(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: role,
        walletAddress: validatedWalletAddress,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token: token,
      user: {
        uid: userRecord.uid,
        email,
        name,
        role,
        walletAddress,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get user profile from Firestore
    let userProfile = {};
    try {
      const userDoc = await firestore
        .collection("users")
        .doc(userRecord.uid)
        .get();

      if (userDoc.exists) {
        userProfile = userDoc.data();
      }
    } catch (firestoreError) {
      console.error("Error getting user profile:", firestoreError);
      // Ensure we have default values
      userProfile = { role: null, walletAddress: null };
    }

    // Create a JWT token for the user
    const token = jwt.sign(
      {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: userProfile.role || null,
        walletAddress: userProfile.walletAddress || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        role: userProfile.role || null,
        walletAddress: userProfile.walletAddress || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = {
  register,
  login,
};
