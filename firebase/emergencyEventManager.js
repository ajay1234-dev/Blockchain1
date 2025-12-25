const { db, firebase } = require("./config");
const UserManager = require("./userManager");

class EmergencyEventManager {
  // Create a new emergency event
  static async createEmergencyEvent(eventData, creatorId) {
    try {
      // Validate input
      if (
        !eventData.name ||
        !eventData.description ||
        !eventData.targetFunding
      ) {
        throw new Error("Missing required event data");
      }

      // Create the emergency event document
      const eventRef = db.collection("emergency_events").doc();
      const eventId = eventRef.id;

      await eventRef.set({
        id: eventId,
        name: eventData.name,
        description: eventData.description,
        status: "active",
        targetFunding: parseFloat(eventData.targetFunding),
        currentFunding: 0,
        raisedFunds: 0,
        location: eventData.location || null,
        category: eventData.category || "other",
        organizer: creatorId,
        startDate:
          eventData.startDate ||
          firebase.firestore.FieldValue.serverTimestamp(),
        endDate: eventData.endDate || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        metadata: eventData.metadata || {},
      });

      // Log the action
      await UserManager.logAction(creatorId, "emergency_event_created", {
        eventId,
        eventName: eventData.name,
        targetFunding: eventData.targetFunding,
      });

      return { success: true, eventId };
    } catch (error) {
      console.error("Error creating emergency event:", error);
      throw error;
    }
  }

  // Get emergency event by ID
  static async getEmergencyEvent(eventId) {
    try {
      const eventRef = db.collection("emergency_events").doc(eventId);
      const doc = await eventRef.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting emergency event:", error);
      throw error;
    }
  }

  // Update emergency event
  static async updateEmergencyEvent(eventId, updateData, updaterId) {
    try {
      const eventRef = db.collection("emergency_events").doc(eventId);
      const doc = await eventRef.get();

      if (!doc.exists) {
        throw new Error("Emergency event not found");
      }

      await eventRef.update({
        ...updateData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Log the action
      await UserManager.logAction(updaterId, "emergency_event_updated", {
        eventId,
        updateData,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating emergency event:", error);
      throw error;
    }
  }

  // Get all active emergency events
  static async getActiveEmergencyEvents(limit = 10) {
    try {
      const snapshot = await db
        .collection("emergency_events")
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const events = [];
      snapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return events;
    } catch (error) {
      console.error("Error getting active emergency events:", error);
      throw error;
    }
  }

  // Update funding for an event
  static async updateEventFunding(eventId, amount, type = "add") {
    try {
      const eventRef = db.collection("emergency_events").doc(eventId);
      const doc = await eventRef.get();

      if (!doc.exists) {
        throw new Error("Emergency event not found");
      }

      const currentFunding = doc.data().currentFunding || 0;
      const newFunding =
        type === "add"
          ? currentFunding + parseFloat(amount)
          : currentFunding - parseFloat(amount);

      await eventRef.update({
        currentFunding: Math.max(0, newFunding),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, newFunding };
    } catch (error) {
      console.error("Error updating event funding:", error);
      throw error;
    }
  }
}

module.exports = EmergencyEventManager;
