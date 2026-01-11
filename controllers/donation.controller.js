const { firestore } = require("../config/firebaseAdmin");
const { transferTokens } = require("../config/ethereum");

// Get all donations
const getDonations = async (req, res) => {
  try {
    const donationsSnapshot = await firestore.collection("donations").get();

    const donations = [];
    donationsSnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res
      .status(500)
      .json({ message: "Error fetching donations", error: error.message });
  }
};

// Get donor's donations
const getDonorDonations = async (req, res) => {
  try {
    const userId = req.user.uid;
    const donationsSnapshot = await firestore
      .collection("donations")
      .where("userId", "==", userId)
      .get();

    const donations = [];
    donationsSnapshot.forEach((doc) => {
      donations.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donor donations:", error);
    res.status(500).json({
      message: "Error fetching donor donations",
      error: error.message,
    });
  }
};

// Create a donation
const createDonation = async (req, res) => {
  try {
    const { disasterId, amount, currency } = req.body;
    const userId = req.user.uid;

    if (!disasterId || !amount || !currency) {
      return res
        .status(400)
        .json({ message: "Disaster ID, amount, and currency are required" });
    }

    // Get disaster info
    const disasterDoc = await firestore
      .collection("disasters")
      .doc(disasterId)
      .get();
    if (!disasterDoc.exists) {
      return res.status(404).json({ message: "Disaster not found" });
    }

    const disaster = disasterDoc.data();

    // Get user info
    const userDoc = await firestore.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userDoc.data();

    // In a real implementation, this would interact with the blockchain
    // For now, we'll simulate the donation and record it in Firestore
    const donationDoc = await firestore.collection("donations").add({
      userId,
      disasterId,
      disasterName: disaster.name,
      amount: parseFloat(amount),
      currency,
      status: "completed", // In a real app, this would be 'pending' initially
      txHash: `mock_tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    // Also record the transaction
    await firestore.collection("transactions").add({
      userId,
      disasterId,
      type: "donation",
      amount: parseFloat(amount),
      currency,
      status: "completed",
      txHash: `mock_tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Donation created successfully",
      donationId: donationDoc.id,
      status: "completed",
      txHash: `mock_tx_${Date.now()}`,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res
      .status(500)
      .json({ message: "Error creating donation", error: error.message });
  }
};

module.exports = {
  getDonations,
  getDonorDonations,
  createDonation,
};
