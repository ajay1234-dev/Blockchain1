const { firestore, auth } = require("../config/firebaseAdmin");

const getCurrentUser = async (req, res) => {
  try {
    const userDoc = await firestore.collection("users").doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    res.status(200).json({
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      walletAddress: userData.walletAddress,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Error fetching user data", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, walletAddress } = req.body;

    const userRef = firestore.collection("users").doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    const updateData = {};
    if (name) updateData.name = name;
    if (walletAddress) {
      // Validate wallet address format
      if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
        return res
          .status(400)
          .json({ message: "Invalid wallet address format" });
      }
      updateData.walletAddress = walletAddress;
    }
    updateData.updatedAt = new Date().toISOString();

    await userRef.update(updateData);

    // Get updated user data
    const updatedUserDoc = await userRef.get();
    const userData = updatedUserDoc.data();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        walletAddress: userData.walletAddress,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await firestore.collection("users").get();

    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        walletAddress: userData.walletAddress,
        createdAt: userData.createdAt,
      });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await firestore.collection("users").doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    res.status(200).json({
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      walletAddress: userData.walletAddress,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["admin", "donor", "beneficiary"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be admin, donor, or beneficiary",
      });
    }

    const userRef = firestore.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Enforce single admin rule
    if (role === "admin") {
      // Check if an admin already exists
      const adminSnapshot = await firestore
        .collection("users")
        .where("role", "==", "admin")
        .limit(1)
        .get();

      if (!adminSnapshot.empty) {
        return res.status(400).json({
          message:
            "An admin account already exists. Only one admin is allowed in the system.",
        });
      }
    }

    // Update user role
    await userRef.update({
      role: role,
      updatedAt: new Date().toISOString(),
    });

    // Get updated user data
    const updatedUserDoc = await userRef.get();
    const userData = updatedUserDoc.data();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        walletAddress: userData.walletAddress,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res
      .status(500)
      .json({ message: "Error updating user role", error: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.user;

    // Get user to delete
    const userToDeleteRef = firestore.collection("users").doc(id);
    const userToDeleteDoc = await userToDeleteRef.get();

    if (!userToDeleteDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToDelete = userToDeleteDoc.data();

    // Prevent admin from deleting themselves
    if (admin.uid === id) {
      return res
        .status(400)
        .json({ message: "Admin cannot delete their own account" });
    }

    // Prevent deletion of another admin (since we only allow one admin)
    if (userToDelete.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin account" });
    }

    // Delete user from Firestore
    await userToDeleteRef.delete();

    // Delete user from Firebase Auth
    try {
      await auth.deleteUser(id);
    } catch (authError) {
      console.error("Error deleting user from Firebase Auth:", authError);
      // Continue with the operation even if auth deletion fails
    }

    // Also delete any related data (beneficiaries, notifications, etc.)
    try {
      // Delete from beneficiaries collection if exists
      const beneficiaryRef = firestore.collection("beneficiaries").doc(id);
      await beneficiaryRef.delete();
    } catch (error) {
      console.error("Error deleting beneficiary data:", error);
    }

    try {
      // Delete any related notifications
      const notificationsSnapshot = await firestore
        .collection("notifications")
        .where("userId", "==", id)
        .get();

      const batch = firestore.batch();
      notificationsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

module.exports = {
  getCurrentUser,
  updateUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
