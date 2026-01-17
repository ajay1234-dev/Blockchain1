const { auth, firestore } = require("../config/firebaseAdmin");

// Get platform configuration
const getPlatformConfig = async (req, res) => {
  try {
    const configRef = firestore
      .collection("system_settings")
      .doc("platform_config");
    const configDoc = await configRef.get();

    if (configDoc.exists) {
      res.status(200).json(configDoc.data());
    } else {
      // Return default configuration if not exists
      res.status(200).json({
        maintenanceMode: false,
        donationsEnabled: true,
        reliefRequestsEnabled: true,
      });
    }
  } catch (error) {
    console.error("Error fetching platform config:", error);
    res
      .status(500)
      .json({
        message: "Error fetching platform config",
        error: error.message,
      });
  }
};

// Update platform configuration
const updatePlatformConfig = async (req, res) => {
  try {
    const { maintenanceMode, donationsEnabled, reliefRequestsEnabled } =
      req.body;
    const admin = req.user;

    // Validate input
    if (
      typeof maintenanceMode !== "boolean" &&
      typeof donationsEnabled !== "boolean" &&
      typeof reliefRequestsEnabled !== "boolean"
    ) {
      return res.status(400).json({ message: "Invalid configuration values" });
    }

    const configRef = firestore
      .collection("system_settings")
      .doc("platform_config");

    const updateData = {};
    if (maintenanceMode !== undefined)
      updateData.maintenanceMode = maintenanceMode;
    if (donationsEnabled !== undefined)
      updateData.donationsEnabled = donationsEnabled;
    if (reliefRequestsEnabled !== undefined)
      updateData.reliefRequestsEnabled = reliefRequestsEnabled;

    await configRef.set(updateData, { merge: true });

    // Log the action
    await logAdminAction(
      admin.uid,
      "update_platform_config",
      "Updated platform configuration",
      {
        maintenanceMode,
        donationsEnabled,
        reliefRequestsEnabled,
      }
    );

    res
      .status(200)
      .json({ message: "Platform configuration updated successfully" });
  } catch (error) {
    console.error("Error updating platform config:", error);
    res
      .status(500)
      .json({
        message: "Error updating platform config",
        error: error.message,
      });
  }
};

// Get blockchain controls
const getBlockchainControls = async (req, res) => {
  try {
    const configRef = firestore
      .collection("system_settings")
      .doc("blockchain_controls");
    const configDoc = await configRef.get();

    if (configDoc.exists) {
      res.status(200).json(configDoc.data());
    } else {
      // Return default configuration if not exists
      res.status(200).json({
        transactionsEnabled: true,
        walletAddress:
          process.env.PLATFORM_WALLET_ADDRESS ||
          "0x0000000000000000000000000000000000000000",
      });
    }
  } catch (error) {
    console.error("Error fetching blockchain controls:", error);
    res
      .status(500)
      .json({
        message: "Error fetching blockchain controls",
        error: error.message,
      });
  }
};

// Update blockchain controls
const updateBlockchainControls = async (req, res) => {
  try {
    const { transactionsEnabled } = req.body;
    const admin = req.user;

    if (typeof transactionsEnabled !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid transactionsEnabled value" });
    }

    const configRef = firestore
      .collection("system_settings")
      .doc("blockchain_controls");
    await configRef.set({ transactionsEnabled }, { merge: true });

    // Log the action
    await logAdminAction(
      admin.uid,
      "update_blockchain_controls",
      "Updated blockchain controls",
      {
        transactionsEnabled,
      }
    );

    res
      .status(200)
      .json({ message: "Blockchain controls updated successfully" });
  } catch (error) {
    console.error("Error updating blockchain controls:", error);
    res
      .status(500)
      .json({
        message: "Error updating blockchain controls",
        error: error.message,
      });
  }
};

// Get content management
const getContent = async (req, res) => {
  try {
    const contentRef = firestore
      .collection("system_settings")
      .doc("content_management");
    const contentDoc = await contentRef.get();

    if (contentDoc.exists) {
      res.status(200).json(contentDoc.data());
    } else {
      // Return default content if not exists
      res.status(200).json({
        termsAndConditions: "",
        privacyPolicy: "",
        emergencyGuidelines: "",
      });
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    res
      .status(500)
      .json({ message: "Error fetching content", error: error.message });
  }
};

// Update content management
const updateContent = async (req, res) => {
  try {
    const { termsAndConditions, privacyPolicy, emergencyGuidelines } = req.body;
    const admin = req.user;

    const contentRef = firestore
      .collection("system_settings")
      .doc("content_management");

    const updateData = {};
    if (termsAndConditions !== undefined)
      updateData.termsAndConditions = termsAndConditions;
    if (privacyPolicy !== undefined) updateData.privacyPolicy = privacyPolicy;
    if (emergencyGuidelines !== undefined)
      updateData.emergencyGuidelines = emergencyGuidelines;

    await contentRef.set(updateData, { merge: true });

    // Log the action
    await logAdminAction(
      admin.uid,
      "update_content",
      "Updated platform content",
      {
        fields: Object.keys(updateData),
      }
    );

    res.status(200).json({ message: "Content updated successfully" });
  } catch (error) {
    console.error("Error updating content:", error);
    res
      .status(500)
      .json({ message: "Error updating content", error: error.message });
  }
};

// Get user management settings
const getUserManagement = async (req, res) => {
  try {
    const configRef = firestore
      .collection("system_settings")
      .doc("user_management");
    const configDoc = await configRef.get();

    // Get user counts
    const donorsSnapshot = await firestore
      .collection("users")
      .where("role", "==", "donor")
      .get();
    const beneficiariesSnapshot = await firestore
      .collection("users")
      .where("role", "==", "beneficiary")
      .get();

    const donorsCount = donorsSnapshot.size;
    const beneficiariesCount = beneficiariesSnapshot.size;

    if (configDoc.exists) {
      res.status(200).json({
        ...configDoc.data(),
        totalUsers: {
          donors: donorsCount,
          beneficiaries: beneficiariesCount,
        },
      });
    } else {
      // Return default configuration if not exists
      res.status(200).json({
        donorsEnabled: true,
        beneficiariesEnabled: true,
        totalUsers: {
          donors: donorsCount,
          beneficiaries: beneficiariesCount,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching user management settings:", error);
    res
      .status(500)
      .json({
        message: "Error fetching user management settings",
        error: error.message,
      });
  }
};

// Update user management settings
const updateUserManagement = async (req, res) => {
  try {
    const { donorsEnabled, beneficiariesEnabled } = req.body;
    const admin = req.user;

    if (donorsEnabled !== undefined && typeof donorsEnabled !== "boolean") {
      return res.status(400).json({ message: "Invalid donorsEnabled value" });
    }

    if (
      beneficiariesEnabled !== undefined &&
      typeof beneficiariesEnabled !== "boolean"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid beneficiariesEnabled value" });
    }

    const configRef = firestore
      .collection("system_settings")
      .doc("user_management");

    const updateData = {};
    if (donorsEnabled !== undefined) updateData.donorsEnabled = donorsEnabled;
    if (beneficiariesEnabled !== undefined)
      updateData.beneficiariesEnabled = beneficiariesEnabled;

    await configRef.set(updateData, { merge: true });

    // Log the action
    await logAdminAction(
      admin.uid,
      "update_user_management",
      "Updated user management settings",
      {
        donorsEnabled,
        beneficiariesEnabled,
      }
    );

    res
      .status(200)
      .json({ message: "User management settings updated successfully" });
  } catch (error) {
    console.error("Error updating user management settings:", error);
    res
      .status(500)
      .json({
        message: "Error updating user management settings",
        error: error.message,
      });
  }
};

// Change admin password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // Note: Proper password verification requires client-side Firebase Auth SDK
    // For admin panel, it's recommended to use Firebase Auth re-authentication
    // This is a simplified implementation

    // Update password in Firebase Auth
    await auth.updateUser(admin.uid, {
      password: newPassword,
    });

    // Log the action
    await logAdminAction(
      admin.uid,
      "change_password",
      "Changed admin password",
      {
        success: true,
      }
    );

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
  }
};

// Logout from all devices
const logoutAllDevices = async (req, res) => {
  try {
    const admin = req.user;

    // In Firebase Auth, we can revoke all refresh tokens for a user
    await auth.revokeRefreshTokens(admin.uid);

    // Log the action
    await logAdminAction(
      admin.uid,
      "logout_all_devices",
      "Logged out from all devices",
      {
        success: true,
      }
    );

    res
      .status(200)
      .json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    console.error("Error logging out from all devices:", error);
    res
      .status(500)
      .json({
        message: "Error logging out from all devices",
        error: error.message,
      });
  }
};

// Get audit logs
const getAuditLogs = async (req, res) => {
  try {
    const logsSnapshot = await firestore
      .collection("admin_logs")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const logs = [];
    logsSnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res
      .status(500)
      .json({ message: "Error fetching audit logs", error: error.message });
  }
};

// Helper function to log admin actions
const logAdminAction = async (adminUid, action, description, details = {}) => {
  try {
    const userDoc = await firestore.collection("users").doc(adminUid).get();
    const adminName = userDoc.exists
      ? userDoc.data().name || userDoc.data().email
      : "Unknown Admin";

    await firestore.collection("admin_logs").add({
      action,
      description,
      details,
      user: adminName,
      userId: adminUid,
      timestamp: new Date().toISOString(),
      ip: null, // Would typically come from req.ip
      userAgent: null, // Would typically come from req.headers['user-agent']
    });
  } catch (error) {
    console.error("Error logging admin action:", error);
  }
};

module.exports = {
  getPlatformConfig,
  updatePlatformConfig,
  getBlockchainControls,
  updateBlockchainControls,
  getContent,
  updateContent,
  getUserManagement,
  updateUserManagement,
  changePassword,
  logoutAllDevices,
  getAuditLogs,
};
