const { firestore } = require("../config/firebaseAdmin");
const {
  getTokenBalance,
  transferTokens,
  getManagerContract,
} = require("../config/ethereum");

// Function to check if user is admin
const isAdmin = async (userId) => {
  try {
    const userDoc = await firestore.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return false;
    }
    return userDoc.data().role === "admin";
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
};

// Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    // Validate address format
    if (!address.startsWith("0x") || address.length !== 42) {
      return res.status(400).json({ message: "Invalid wallet address format" });
    }

    // Get token balance from blockchain
    const balance = await getTokenBalance(address);

    res.status(200).json({
      address,
      balance: balance.toString(),
    });
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    res.status(500).json({
      message: "Error retrieving wallet balance",
      error: error.message,
    });
  }
};

// Transfer tokens
const initiateTokenTransfer = async (req, res) => {
  try {
    const { to, amount } = req.body;
    const user = req.user;

    if (!to || !amount) {
      return res
        .status(400)
        .json({ message: "Recipient address and amount are required" });
    }

    // Validate address format
    if (!to.startsWith("0x") || to.length !== 42) {
      return res
        .status(400)
        .json({ message: "Invalid recipient wallet address format" });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    // Perform token transfer using the imported function
    const tx = await transferTokens(to, amount);

    // Log the transaction in Firestore
    await firestore.collection("transactions").add({
      from: user.walletAddress,
      to,
      amount,
      type: "transfer",
      txHash: tx.hash,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      status: "pending", // Initially pending, will be updated after confirmation
    });

    res.status(200).json({
      message: "Token transfer initiated successfully",
      transaction: {
        hash: tx.hash,
        from: user.walletAddress,
        to,
        amount,
      },
    });
  } catch (error) {
    console.error("Error transferring tokens:", error);
    res
      .status(500)
      .json({ message: "Error transferring tokens", error: error.message });
  }
};

// Create a disaster event
const createDisasterEvent = async (req, res) => {
  try {
    const { name, description } = req.body;
    const admin = req.user;

    // Check if user is admin
    const isAdminUser = await isAdmin(admin.uid);
    if (!isAdminUser) {
      return res.status(403).json({
        message: "Only admin users can create disaster events",
      });
    }

    if (!name || !description) {
      return res.status(400).json({
        message: "Name and description are required for disaster event",
      });
    }

    const managerContract = getManagerContract();

    // Get admin's name from users collection
    const adminDoc = await firestore.collection("users").doc(admin.uid).get();
    const adminName = adminDoc.exists
      ? adminDoc.data().name || adminDoc.data().email
      : "Unknown Admin";

    // In a real implementation, this would call the smart contract
    // For now, we'll simulate the creation in Firestore
    const disasterDoc = await firestore.collection("disasters").add({
      name,
      description,
      createdBy: admin.uid,
      createdByName: adminName, // Store admin's name as well
      createdAt: new Date().toISOString(),
      status: "active",
    });

    res.status(201).json({
      message: "Disaster event created successfully",
      disasterId: disasterDoc.id,
      name,
      description,
    });
  } catch (error) {
    console.error("Error creating disaster event:", error);
    res
      .status(500)
      .json({ message: "Error creating disaster event", error: error.message });
  }
};

// Approve a beneficiary for a disaster event
const approveBeneficiary = async (req, res) => {
  try {
    const { beneficiaryId, eventId } = req.body;
    const admin = req.user;

    // Check if user is admin
    const isAdminUser = await isAdmin(admin.uid);
    if (!isAdminUser) {
      return res.status(403).json({
        message: "Only admin users can approve beneficiaries",
      });
    }

    if (!beneficiaryId || !eventId) {
      return res
        .status(400)
        .json({ message: "Beneficiary ID and Event ID are required" });
    }

    // Check if beneficiary exists
    const beneficiaryDoc = await firestore
      .collection("users")
      .doc(beneficiaryId)
      .get();
    if (!beneficiaryDoc.exists) {
      return res.status(404).json({ message: "Beneficiary not found" });
    }

    const beneficiary = beneficiaryDoc.data();
    if (beneficiary.role !== "beneficiary") {
      return res.status(400).json({ message: "User is not a beneficiary" });
    }

    // Check if disaster event exists
    const disasterDoc = await firestore
      .collection("disasters")
      .doc(eventId)
      .get();
    if (!disasterDoc.exists) {
      return res.status(404).json({ message: "Disaster event not found" });
    }

    // Update beneficiary status
    await firestore.collection("beneficiaries").doc(beneficiaryId).set(
      {
        userId: beneficiaryId,
        eventId,
        approved: true,
        approvedBy: admin.uid,
        approvedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    res.status(200).json({
      message: "Beneficiary approved successfully",
      beneficiaryId,
      eventId,
    });
  } catch (error) {
    console.error("Error approving beneficiary:", error);
    res
      .status(500)
      .json({ message: "Error approving beneficiary", error: error.message });
  }
};

module.exports = {
  getWalletBalance,
  initiateTokenTransfer,
  createDisasterEvent,
  approveBeneficiary,
};
