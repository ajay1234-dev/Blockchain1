const { db, firebase } = require("./config");
const UserManager = require("./userManager");
const BeneficiaryManager = require("./beneficiaryManager");
const VendorManager = require("./vendorManager");

class TransactionManager {
  // Record a new transaction
  static async recordTransaction(transactionData, creatorId) {
    try {
      // Validate input
      if (
        !transactionData.type ||
        !transactionData.from ||
        !transactionData.to ||
        !transactionData.amount
      ) {
        throw new Error("Missing required transaction data");
      }

      // Create the transaction document
      const transactionRef = db.collection("transactions").doc();
      const transactionId = transactionRef.id;

      await transactionRef.set({
        id: transactionId,
        type: transactionData.type,
        from: transactionData.from,
        to: transactionData.to,
        amount: parseFloat(transactionData.amount),
        amountUSD: transactionData.amountUSD || 0,
        category: transactionData.category || "general",
        eventId: transactionData.eventId || "",
        description: transactionData.description || "",
        ethereumTxHash: transactionData.ethereumTxHash || "",
        status: transactionData.status || "completed",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        metadata: transactionData.metadata || {},
        createdBy: creatorId,
      });

      // Log the action
      await UserManager.logAction(creatorId, "transaction_recorded", {
        transactionId,
        type: transactionData.type,
        amount: transactionData.amount,
        from: transactionData.from,
        to: transactionData.to,
      });

      return { success: true, transactionId };
    } catch (error) {
      console.error("Error recording transaction:", error);
      throw error;
    }
  }

  // Get transaction by ID
  static async getTransaction(transactionId) {
    try {
      const transactionRef = db.collection("transactions").doc(transactionId);
      const doc = await transactionRef.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting transaction:", error);
      throw error;
    }
  }

  // Get transactions for an event
  static async getTransactionsForEvent(eventId, limit = 20) {
    try {
      const snapshot = await db
        .collection("transactions")
        .where("eventId", "==", eventId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      const transactions = [];
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return transactions;
    } catch (error) {
      console.error("Error getting transactions for event:", error);
      throw error;
    }
  }

  // Get transactions for a beneficiary
  static async getTransactionsForBeneficiary(beneficiaryId, limit = 20) {
    try {
      const snapshot = await db
        .collection("transactions")
        .where("to.id", "==", beneficiaryId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      const transactions = [];
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return transactions;
    } catch (error) {
      console.error("Error getting transactions for beneficiary:", error);
      throw error;
    }
  }

  // Process a spending transaction from beneficiary to vendor
  static async processSpendingTransaction(
    beneficiaryId,
    vendorId,
    amount,
    category,
    operatorId
  ) {
    try {
      // Get beneficiary and vendor data
      const beneficiary = await BeneficiaryManager.getBeneficiary(
        beneficiaryId
      );
      const vendor = await VendorManager.getVendor(vendorId);

      if (!beneficiary) {
        throw new Error("Beneficiary not found");
      }

      if (!vendor) {
        throw new Error("Vendor not found");
      }

      if (!vendor.whitelisted) {
        throw new Error("Vendor is not whitelisted");
      }

      // Check if beneficiary has sufficient funds in the specified category
      const categoryData = beneficiary.reliefPackage.categories[category];
      if (!categoryData || categoryData.remaining < amount) {
        throw new Error(`Insufficient funds in ${category} category`);
      }

      // Create transaction record
      const transactionData = {
        type: "spending",
        from: { type: "beneficiary", id: beneficiaryId },
        to: { type: "vendor", id: vendorId },
        amount: amount,
        category: category,
        eventId: beneficiary.eventId,
        description: `Spending from ${category} category`,
        status: "completed",
      };

      const transactionResult = await this.recordTransaction(
        transactionData,
        operatorId
      );

      if (!transactionResult.success) {
        throw new Error("Failed to record transaction");
      }

      // Update beneficiary's category spending
      const beneficiaryRef = db.collection("beneficiaries").doc(beneficiaryId);
      await beneficiaryRef.update({
        [`reliefPackage.categories.${category}.spent`]:
          firebase.firestore.FieldValue.increment(amount),
        [`reliefPackage.categories.${category}.remaining`]:
          firebase.firestore.FieldValue.increment(-amount),
        "reliefPackage.remainingAmount":
          firebase.firestore.FieldValue.increment(-amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(
        operatorId,
        "spending_transaction_processed",
        {
          beneficiaryId,
          vendorId,
          amount,
          category,
        }
      );

      return {
        success: true,
        transactionId: transactionResult.transactionId,
        newRemaining: categoryData.remaining - amount,
      };
    } catch (error) {
      console.error("Error processing spending transaction:", error);
      throw error;
    }
  }

  // Process a donation transaction
  static async processDonation(donationData, donorId) {
    try {
      // Validate input
      if (!donationData.amount || !donationData.currency) {
        throw new Error("Missing required donation data");
      }

      // Create donation record
      const donationRef = db.collection("donations").doc();
      const donationId = donationRef.id;

      await donationRef.set({
        id: donationId,
        donorId: donorId,
        ethereumAddress: donationData.ethereumAddress || "",
        amount: parseFloat(donationData.amount),
        amountERS: donationData.amountERS || 0,
        currency: donationData.currency,
        eventId: donationData.eventId || "",
        anonymous: donationData.anonymous || false,
        message: donationData.message || "",
        ethereumTxHash: donationData.ethereumTxHash || "",
        status: donationData.status || "completed",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        metadata: donationData.metadata || {},
      });

      // Update emergency event funding if eventId is provided
      if (donationData.eventId) {
        await require("./emergencyEventManager").updateEventFunding(
          donationData.eventId,
          donationData.amountERS || donationData.amount,
          "add"
        );
      }

      // Log the action
      await UserManager.logAction(donorId, "donation_processed", {
        donationId,
        amount: donationData.amount,
        currency: donationData.currency,
        eventId: donationData.eventId,
      });

      return { success: true, donationId };
    } catch (error) {
      console.error("Error processing donation:", error);
      throw error;
    }
  }
}

module.exports = TransactionManager;
