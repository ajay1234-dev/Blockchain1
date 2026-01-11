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
    const validRoles = ["admin", "donor", "beneficiary", "vendor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be admin, donor, beneficiary, or vendor",
      });
    }
    const userRef = firestore.collection("users").doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
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

module.exports = {
  getCurrentUser,
  updateUser,
  getAllUsers,
  getUserById,
  updateUserRole,
};
