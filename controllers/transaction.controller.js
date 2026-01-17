const { firestore } = require("../config/firebaseAdmin");

const logTransaction = async (req, res) => {
  try {
    const { txHash, fromAddress, toAddress, amount, purpose, contractAddress } =
      req.body;
    const userId = req.user.uid;
    const role = req.user.role;

    if (!txHash || !fromAddress || !toAddress || !amount || !purpose) {
      return res.status(400).json({
        message:
          "Transaction hash, from address, to address, amount, and purpose are required",
      });
    }

    // Create transaction log
    const transactionLog = {
      txHash,
      fromAddress: fromAddress.toLowerCase(),
      toAddress: toAddress.toLowerCase(),
      amount: parseFloat(amount),
      userId,
      role,
      purpose,
      contractAddress: contractAddress || null,
      network: "sepolia",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Add to transactions collection
    await firestore.collection("transactions").add(transactionLog);

    res.status(201).json({
      message: "Transaction logged successfully",
      transactionId: transactionLog.id,
    });
  } catch (error) {
    console.error("Transaction logging error:", error);
    res.status(500).json({
      message: "Transaction logging failed",
      error: error.message,
    });
  }
};

const getUserTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    const transactionsSnapshot = await firestore
      .collection("transactions")
      .where("userId", "==", userId)
      .get();

    const transactions = [];
    transactionsSnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort transactions by timestamp in descending order (most recent first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({
      message: "Failed to get transaction history",
      error: error.message,
    });
  }
};

const getAdminTransactionAudit = async (req, res) => {
  try {
    const transactionsSnapshot = await firestore
      .collection("transactions")
      .limit(100) // Limit for performance
      .get();

    const transactions = [];
    transactionsSnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort transactions by timestamp in descending order (most recent first)
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get summary statistics
    const summary = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      uniqueUsers: [...new Set(transactions.map((tx) => tx.userId))].length,
    };

    res.status(200).json({
      transactions,
      summary,
    });
  } catch (error) {
    console.error("Get admin audit error:", error);
    res.status(500).json({
      message: "Failed to get admin audit",
      error: error.message,
    });
  }
};

module.exports = {
  logTransaction,
  getUserTransactionHistory,
  getAdminTransactionAudit,
};
