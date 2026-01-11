const { firestore } = require("../config/firebaseAdmin");
const { ethers } = require("ethers");

const linkWallet = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    const userId = req.user.uid;

    if (!walletAddress || !signature) {
      return res
        .status(400)
        .json({ message: "Wallet address and signature are required" });
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ message: "Invalid wallet address format" });
    }

    // Verify ownership of the wallet by checking the signature
    // We'll use a simple message for verification
    const message = `Link wallet to account: ${userId}`;
    const messageHash = ethers.hashMessage(message);
    const recoveredAddress = ethers.recoverAddress(messageHash, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({ message: "Signature verification failed" });
    }

    // Check if wallet is already linked to another user
    const existingUserSnapshot = await firestore
      .collection("users")
      .where("walletAddress", "==", walletAddress)
      .limit(1)
      .get();

    if (!existingUserSnapshot.empty) {
      return res.status(400).json({
        message: "Wallet address is already linked to another account",
      });
    }

    // Update user's wallet address in Firestore
    await firestore.collection("users").doc(userId).update({
      walletAddress: walletAddress,
      updatedAt: new Date().toISOString(),
    });

    // Update the user's JWT token to include the new wallet address
    const jwt = require("jsonwebtoken");
    const updatedToken = jwt.sign(
      {
        ...req.user,
        walletAddress: walletAddress,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.status(200).json({
      message: "Wallet linked successfully",
      token: updatedToken,
      walletAddress: walletAddress,
    });
  } catch (error) {
    console.error("Wallet linking error:", error);
    res
      .status(500)
      .json({ message: "Wallet linking failed", error: error.message });
  }
};

const getWalletInfo = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await firestore.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    res.status(200).json({
      walletAddress: userData.walletAddress || null,
      userId: userId,
      email: userData.email,
    });
  } catch (error) {
    console.error("Get wallet info error:", error);
    res
      .status(500)
      .json({ message: "Failed to get wallet info", error: error.message });
  }
};

module.exports = {
  linkWallet,
  getWalletInfo,
};
