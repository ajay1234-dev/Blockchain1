// firebase/disasterManager.js
const { db, admin } = require("./config");
const { COLLECTIONS } = require("./firestore_schema");
const UserManager = require("./userManager");

class DisasterManager {
  // Create a new disaster event
  static async createDisaster(disasterData, creatorId) {
    try {
      // Validate input
      if (
        !disasterData.name ||
        !disasterData.description ||
        !disasterData.targetFunding
      ) {
        throw new Error("Missing required disaster data");
      }

      // Create the disaster document
      const disasterRef = db.collection(COLLECTIONS.DISASTERS).doc();
      const disasterId = disasterRef.id;

      await disasterRef.set({
        id: disasterId,
        name: disasterData.name,
        description: disasterData.description,
        status: "active",
        targetFunding: parseFloat(disasterData.targetFunding),
        currentFunding: 0,
        raisedFunds: 0,
        location: disasterData.location || null,
        category: disasterData.category || "other",
        organizer: creatorId,
        startDate:
          disasterData.startDate ||
          admin.firestore.FieldValue.serverTimestamp(),
        endDate: disasterData.endDate || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          images: disasterData.images || [],
          documents: disasterData.documents || [],
          stats: {
            beneficiariesCount: 0,
            fundsDistributed: 0,
            vendorsActive: 0,
          },
        },
      });

      // Log the action
      await UserManager.logAction(creatorId, "disaster_event_created", {
        disasterId,
        disasterName: disasterData.name,
        targetFunding: disasterData.targetFunding,
      });

      return { success: true, disasterId };
    } catch (error) {
      console.error("Error creating disaster event:", error);
      throw error;
    }
  }

  // Get disaster by ID
  static async getDisaster(disasterId) {
    try {
      const disasterRef = db.collection(COLLECTIONS.DISASTERS).doc(disasterId);
      const doc = await disasterRef.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting disaster:", error);
      throw error;
    }
  }

  // Update disaster
  static async updateDisaster(disasterId, updateData, updaterId) {
    try {
      const disasterRef = db.collection(COLLECTIONS.DISASTERS).doc(disasterId);
      const doc = await disasterRef.get();

      if (!doc.exists) {
        throw new Error("Disaster not found");
      }

      await disasterRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(updaterId, "disaster_event_updated", {
        disasterId,
        updateData,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating disaster:", error);
      throw error;
    }
  }

  // Get all active disasters
  static async getActiveDisasters(limit = 10) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.DISASTERS)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const disasters = [];
      snapshot.forEach((doc) => {
        disasters.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return disasters;
    } catch (error) {
      console.error("Error getting active disasters:", error);
      throw error;
    }
  }

  // Update funding for a disaster
  static async updateDisasterFunding(disasterId, amount, type = "add") {
    try {
      const disasterRef = db.collection(COLLECTIONS.DISASTERS).doc(disasterId);
      const doc = await disasterRef.get();

      if (!doc.exists) {
        throw new Error("Disaster not found");
      }

      const currentFunding = doc.data().currentFunding || 0;
      const newFunding =
        type === "add"
          ? currentFunding + parseFloat(amount)
          : currentFunding - parseFloat(amount);

      await disasterRef.update({
        currentFunding: Math.max(0, newFunding),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, newFunding };
    } catch (error) {
      console.error("Error updating disaster funding:", error);
      throw error;
    }
  }

  // Update disaster statistics
  static async updateDisasterStats(disasterId, statUpdates) {
    try {
      const disasterRef = db.collection(COLLECTIONS.DISASTERS).doc(disasterId);

      const updateData = {};
      for (const [stat, value] of Object.entries(statUpdates)) {
        if (typeof value === "number") {
          updateData[`metadata.stats.${stat}`] =
            admin.firestore.FieldValue.increment(value);
        } else {
          updateData[`metadata.stats.${stat}`] = value;
        }
      }

      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await disasterRef.update(updateData);

      return { success: true };
    } catch (error) {
      console.error("Error updating disaster stats:", error);
      throw error;
    }
  }

  // Deactivate disaster
  static async deactivateDisaster(disasterId, deactivatedBy) {
    try {
      const disasterRef = db.collection(COLLECTIONS.DISASTERS).doc(disasterId);

      await disasterRef.update({
        status: "inactive",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(deactivatedBy, "disaster_event_deactivated", {
        disasterId,
      });

      return { success: true };
    } catch (error) {
      console.error("Error deactivating disaster:", error);
      throw error;
    }
  }
}

module.exports = DisasterManager;
