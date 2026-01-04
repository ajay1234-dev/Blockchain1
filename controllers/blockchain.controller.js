const { getFirestore } = require("../config/firebase");
const {
  getTokenBalance,
  transferTokens,
  getManagerContract,
} = require("../config/ethereum");

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
    res
      .status(500)
      .json({
        message: "Error retrieving wallet balance",
        error: error.message,
      });
  }
};

// Transfer tokens
const initiateTokenTransfer = async (req, res) => {
  try {
    const { to, amount } = req.body;
    const user = req.currentUser;

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
    const firestore = getFirestore();
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
    const admin = req.currentUser;

    if (!name || !description) {
      return res
        .status(400)
        .json({
          message: "Name and description are required for disaster event",
        });
    }

    const managerContract = getManagerContract();

    // In a real implementation, this would call the smart contract
    // For now, we'll simulate the creation in Firestore
    const firestore = getFirestore();
    const disasterDoc = await firestore.collection("disasters").add({
      name,
      description,
      createdBy: admin.uid,
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
    const admin = req.currentUser;

    if (!beneficiaryId || !eventId) {
      return res
        .status(400)
        .json({ message: "Beneficiary ID and Event ID are required" });
    }

    const firestore = getFirestore();

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

// Approve a vendor for a disaster event
const approveVendor = async (req, res) => {
  try {
    const { vendorId, eventId } = req.body;
    const admin = req.currentUser;

    if (!vendorId || !eventId) {
      return res
        .status(400)
        .json({ message: "Vendor ID and Event ID are required" });
    }

    const firestore = getFirestore();

    // Check if vendor exists
    const vendorDoc = await firestore.collection("users").doc(vendorId).get();
    if (!vendorDoc.exists) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const vendor = vendorDoc.data();
    if (vendor.role !== "vendor") {
      return res.status(400).json({ message: "User is not a vendor" });
    }

    // Check if disaster event exists
    const disasterDoc = await firestore
      .collection("disasters")
      .doc(eventId)
      .get();
    if (!disasterDoc.exists) {
      return res.status(404).json({ message: "Disaster event not found" });
    }

    // Update vendor status
    await firestore.collection("vendors").doc(vendorId).set(
      {
        userId: vendorId,
        eventId,
        approved: true,
        approvedBy: admin.uid,
        approvedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    res.status(200).json({
      message: "Vendor approved successfully",
      vendorId,
      eventId,
    });
  } catch (error) {
    console.error("Error approving vendor:", error);
    res
      .status(500)
      .json({ message: "Error approving vendor", error: error.message });
  }
};

module.exports = {
  getWalletBalance,
  initiateTokenTransfer,
  createDisasterEvent,
  approveBeneficiary,
  approveVendor,
};
