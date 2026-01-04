const { getFirestore, getAuth } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    // Check if user already exists in Firebase Auth
    try {
      await getAuth().getUserByEmail(email);
      return res.status(400).json({ message: "User already exists" });
    } catch (error) {
      // User doesn't exist, continue with registration
    }

    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create user profile in Firestore
    const firestore = getFirestore();

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
      // If Firestore fails, we can still proceed with the registration but log the error
      console.warn(
        "Failed to create user profile in Firestore, but user was created in Auth:",
        firestoreError.message
      );
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

    // In a real implementation, you would verify credentials with Firebase Auth
    // For now, we'll create a custom token after verifying the user exists
    let userRecord;
    try {
      userRecord = await getAuth().getUserByEmail(email);
    } catch (error) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Get user profile from Firestore
    let userProfile = {};
    try {
      const firestore = getFirestore();
      const userDoc = await firestore
        .collection("users")
        .doc(userRecord.uid)
        .get();

      if (userDoc.exists) {
        userProfile = userDoc.data();
      }
    } catch (firestoreError) {
      // If Firestore access fails, continue with just Firebase Auth data
      console.warn(
        "Firestore access failed, using auth data only:",
        firestoreError.message
      );
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
