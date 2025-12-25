const { db, firebase } = require("./config");
const UserManager = require("./userManager");

class BeneficiaryManager {
  // Register a new beneficiary
  static async registerBeneficiary(beneficiaryData, operatorId) {
    try {
      // Validate input
      if (!beneficiaryData.userId || !beneficiaryData.eventId) {
        throw new Error("Missing required beneficiary data");
      }

      // Create the beneficiary document
      const beneficiaryRef = db.collection("beneficiaries").doc();
      const beneficiaryId = beneficiaryRef.id;

      await beneficiaryRef.set({
        id: beneficiaryId,
        userId: beneficiaryData.userId,
        ethereumAddress: beneficiaryData.ethereumAddress || "",
        eventId: beneficiaryData.eventId,
        status: "pending", // Awaiting approval
        personalInfo: {
          firstName: beneficiaryData.firstName || "",
          lastName: beneficiaryData.lastName || "",
          age: beneficiaryData.age || null,
          gender: beneficiaryData.gender || "",
          familySize: beneficiaryData.familySize || 1,
          specialNeeds: beneficiaryData.specialNeeds || "",
        },
        location: beneficiaryData.location || null,
        reliefPackage: {
          totalAmount: 0,
          remainingAmount: 0,
          categories: {
            food: { allocated: 0, spent: 0, remaining: 0 },
            medicine: { allocated: 0, spent: 0, remaining: 0 },
            shelter: { allocated: 0, spent: 0, remaining: 0 },
          },
        },
        distributionHistory: [],
        verificationStatus: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(operatorId, "beneficiary_registered", {
        beneficiaryId,
        userId: beneficiaryData.userId,
        eventId: beneficiaryData.eventId,
      });

      return { success: true, beneficiaryId };
    } catch (error) {
      console.error("Error registering beneficiary:", error);
      throw error;
    }
  }

  // Approve a beneficiary
  static async approveBeneficiary(beneficiaryId, operatorId, allocationAmount) {
    try {
      const beneficiaryRef = db.collection("beneficiaries").doc(beneficiaryId);
      const doc = await beneficiaryRef.get();

      if (!doc.exists) {
        throw new Error("Beneficiary not found");
      }

      const beneficiaryData = doc.data();

      // Update beneficiary status and allocation
      await beneficiaryRef.update({
        status: "approved",
        verificationStatus: "verified",
        "reliefPackage.totalAmount": allocationAmount,
        "reliefPackage.remainingAmount": allocationAmount,
        "reliefPackage.categories.food.allocated": allocationAmount * 0.4, // 40% for food
        "reliefPackage.categories.food.remaining": allocationAmount * 0.4,
        "reliefPackage.categories.medicine.allocated": allocationAmount * 0.3, // 30% for medicine
        "reliefPackage.categories.medicine.remaining": allocationAmount * 0.3,
        "reliefPackage.categories.shelter.allocated": allocationAmount * 0.3, // 30% for shelter
        "reliefPackage.categories.shelter.remaining": allocationAmount * 0.3,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(operatorId, "beneficiary_approved", {
        beneficiaryId,
        userId: beneficiaryData.userId,
        allocationAmount,
      });

      return { success: true };
    } catch (error) {
      console.error("Error approving beneficiary:", error);
      throw error;
    }
  }

  // Get beneficiary by ID
  static async getBeneficiary(beneficiaryId) {
    try {
      const beneficiaryRef = db.collection("beneficiaries").doc(beneficiaryId);
      const doc = await beneficiaryRef.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting beneficiary:", error);
      throw error;
    }
  }

  // Get beneficiaries for an event
  static async getBeneficiariesForEvent(eventId, status = null) {
    try {
      let query = db
        .collection("beneficiaries")
        .where("eventId", "==", eventId);

      if (status) {
        query = query.where("status", "==", status);
      }

      const snapshot = await query.get();

      const beneficiaries = [];
      snapshot.forEach((doc) => {
        beneficiaries.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return beneficiaries;
    } catch (error) {
      console.error("Error getting beneficiaries for event:", error);
      throw error;
    }
  }

  // Update beneficiary's relief package after distribution
  static async updateReliefPackage(
    beneficiaryId,
    amount,
    category,
    transactionId,
    operatorId
  ) {
    try {
      const beneficiaryRef = db.collection("beneficiaries").doc(beneficiaryId);
      const doc = await beneficiaryRef.get();

      if (!doc.exists) {
        throw new Error("Beneficiary not found");
      }

      const beneficiaryData = doc.data();
      const categoryData = beneficiaryData.reliefPackage.categories[category];

      if (!categoryData) {
        throw new Error(`Invalid category: ${category}`);
      }

      // Calculate new values
      const newAllocated = categoryData.allocated + amount;
      const newSpent = categoryData.spent;
      const newRemaining = newAllocated - newSpent;

      // Update the beneficiary's relief package
      await beneficiaryRef.update({
        [`reliefPackage.categories.${category}.allocated`]: newAllocated,
        [`reliefPackage.categories.${category}.remaining`]: newRemaining,
        "reliefPackage.totalAmount":
          firebase.firestore.FieldValue.increment(amount),
        "reliefPackage.remainingAmount":
          firebase.firestore.FieldValue.increment(amount),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Add to distribution history
      await beneficiaryRef.collection("distribution_history").add({
        eventId: beneficiaryData.eventId,
        amount: amount,
        category: category,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        distributor: operatorId,
        transactionId: transactionId,
      });

      // Log the action
      await UserManager.logAction(operatorId, "relief_package_updated", {
        beneficiaryId,
        amount,
        category,
        transactionId,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating relief package:", error);
      throw error;
    }
  }
}

module.exports = BeneficiaryManager;
