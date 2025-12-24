// firebase/userManager.js
const { db, auth, admin } = require("./config");
const { COLLECTIONS } = require("./firestore_schema");

class UserManager {
  // Create or update user profile
  static async createUserProfile(userId, userData) {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      const doc = await userRef.get();

      if (doc.exists) {
        // Update existing user
        await userRef.update({
          ...userData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Create new user
        await userRef.set({
          uid: userId,
          ...userData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true,
        });
      }

      // Log the action
      await this.logAction(userId, "user_profile_created_or_updated", {
        userId,
        action: "create_profile",
        userData,
      });

      return { success: true, userId };
    } catch (error) {
      console.error("Error creating/updating user profile:", error);
      throw error;
    }
  }

  // Get user profile by UID
  static async getUserProfile(userId) {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      const doc = await userRef.get();

      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  // Update user role
  static async updateUserRole(userId, newRole, updatedBy) {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
      await userRef.update({
        role: newRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.logAction(updatedBy, "role_change", {
        userId,
        oldRole: (await userRef.get()).data().role,
        newRole,
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Get user by Ethereum address
  static async getUserByEthereumAddress(ethereumAddress) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.USERS)
        .where("ethereumAddress", "==", ethereumAddress)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user by Ethereum address:", error);
      throw error;
    }
  }

  // Log audit action
  static async logAction(actorId, action, details, ipAddress = null) {
    try {
      await db.collection(COLLECTIONS.AUDIT_LOGS).add({
        action,
        actor: {
          type: "user",
          id: actorId,
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details,
        ipAddress,
        severity: "info",
      });
    } catch (error) {
      console.error("Error logging action:", error);
    }
  }

  // Validate user role for access control
  static async validateUserRole(userId, allowedRoles) {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) {
        return { valid: false, error: "User not found" };
      }

      if (!allowedRoles.includes(user.role)) {
        return { valid: false, error: "Insufficient permissions" };
      }

      return { valid: true, user };
    } catch (error) {
      console.error("Error validating user role:", error);
      return { valid: false, error: error.message };
    }
  }
}

module.exports = UserManager;
