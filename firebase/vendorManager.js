// firebase/vendorManager.js
const { db, admin } = require("./config");
const { COLLECTIONS } = require("./firestore_schema");
const UserManager = require("./userManager");

class VendorManager {
  // Register a new vendor
  static async registerVendor(vendorData, operatorId) {
    try {
      // Validate input
      if (!vendorData.userId || !vendorData.businessName) {
        throw new Error("Missing required vendor data");
      }

      // Create the vendor document
      const vendorRef = db.collection(COLLECTIONS.VENDORS).doc();
      const vendorId = vendorRef.id;

      await vendorRef.set({
        id: vendorId,
        userId: vendorData.userId,
        ethereumAddress: vendorData.ethereumAddress || "",
        businessName: vendorData.businessName,
        businessType: vendorData.businessType || "",
        licenseInfo: vendorData.licenseInfo || {},
        location: vendorData.location || null,
        services: vendorData.services || [],
        verificationStatus: "pending",
        rating: 0,
        totalTransactions: 0,
        whitelisted: false,
        approvedBy: null,
        approvedAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(operatorId, "vendor_registered", {
        vendorId,
        userId: vendorData.userId,
        businessName: vendorData.businessName,
      });

      return { success: true, vendorId };
    } catch (error) {
      console.error("Error registering vendor:", error);
      throw error;
    }
  }

  // Approve a vendor
  static async approveVendor(vendorId, operatorId) {
    try {
      const vendorRef = db.collection(COLLECTIONS.VENDORS).doc(vendorId);
      const doc = await vendorRef.get();

      if (!doc.exists) {
        throw new Error("Vendor not found");
      }

      const vendorData = doc.data();

      // Update vendor status
      await vendorRef.update({
        verificationStatus: "verified",
        whitelisted: true,
        approvedBy: operatorId,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(operatorId, "vendor_approved", {
        vendorId,
        userId: vendorData.userId,
        businessName: vendorData.businessName,
      });

      return { success: true };
    } catch (error) {
      console.error("Error approving vendor:", error);
      throw error;
    }
  }

  // Get vendor by ID
  static async getVendor(vendorId) {
    try {
      const vendorRef = db.collection(COLLECTIONS.VENDORS).doc(vendorId);
      const doc = await vendorRef.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting vendor:", error);
      throw error;
    }
  }

  // Get whitelisted vendors by service category
  static async getWhitelistedVendorsByService(service, limit = 10) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.VENDORS)
        .where("services", "array-contains", service)
        .where("whitelisted", "==", true)
        .where("verificationStatus", "==", "verified")
        .limit(limit)
        .get();

      const vendors = [];
      snapshot.forEach((doc) => {
        vendors.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return vendors;
    } catch (error) {
      console.error("Error getting whitelisted vendors by service:", error);
      throw error;
    }
  }

  // Update vendor rating after transaction
  static async updateVendorRating(vendorId, newRating, operatorId) {
    try {
      const vendorRef = db.collection(COLLECTIONS.VENDORS).doc(vendorId);
      const doc = await vendorRef.get();

      if (!doc.exists) {
        throw new Error("Vendor not found");
      }

      const vendorData = doc.data();
      const currentRating = vendorData.rating || 0;
      const currentTransactions = vendorData.totalTransactions || 0;

      // Calculate new average rating
      const newAverageRating =
        (currentRating * currentTransactions + newRating) /
        (currentTransactions + 1);

      // Update vendor rating and transaction count
      await vendorRef.update({
        rating: newAverageRating,
        totalTransactions: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(operatorId, "vendor_rated", {
        vendorId,
        newRating,
        newAverageRating,
      });

      return { success: true, newAverageRating };
    } catch (error) {
      console.error("Error updating vendor rating:", error);
      throw error;
    }
  }

  // Get all vendors by verification status
  static async getVendorsByStatus(status, limit = 20) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.VENDORS)
        .where("verificationStatus", "==", status)
        .limit(limit)
        .get();

      const vendors = [];
      snapshot.forEach((doc) => {
        vendors.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return vendors;
    } catch (error) {
      console.error("Error getting vendors by status:", error);
      throw error;
    }
  }

  // Update vendor whitelist status
  static async updateVendorWhitelistStatus(vendorId, whitelisted, operatorId) {
    try {
      const vendorRef = db.collection(COLLECTIONS.VENDORS).doc(vendorId);

      await vendorRef.update({
        whitelisted: whitelisted,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(operatorId, "vendor_whitelist_updated", {
        vendorId,
        whitelisted,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating vendor whitelist status:", error);
      throw error;
    }
  }
}

module.exports = VendorManager;
