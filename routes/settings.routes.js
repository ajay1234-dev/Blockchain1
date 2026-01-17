const express = require("express");
const {
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
} = require("../controllers/settings.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Platform configuration
router.get(
  "/config",
  authenticateToken,
  authorizeRoles(["admin"]),
  getPlatformConfig
);
router.put(
  "/config",
  authenticateToken,
  authorizeRoles(["admin"]),
  updatePlatformConfig
);

// Blockchain controls
router.get(
  "/blockchain",
  authenticateToken,
  authorizeRoles(["admin"]),
  getBlockchainControls
);
router.put(
  "/blockchain",
  authenticateToken,
  authorizeRoles(["admin"]),
  updateBlockchainControls
);

// Content management
router.get(
  "/content",
  authenticateToken,
  authorizeRoles(["admin"]),
  getContent
);
router.put(
  "/content",
  authenticateToken,
  authorizeRoles(["admin"]),
  updateContent
);

// User management
router.get(
  "/user-management",
  authenticateToken,
  authorizeRoles(["admin"]),
  getUserManagement
);
router.put(
  "/user-management",
  authenticateToken,
  authorizeRoles(["admin"]),
  updateUserManagement
);

// Security
router.post(
  "/change-password",
  authenticateToken,
  authorizeRoles(["admin"]),
  changePassword
);
router.post(
  "/logout-all",
  authenticateToken,
  authorizeRoles(["admin"]),
  logoutAllDevices
);

// Audit logs
router.get("/logs", authenticateToken, authorizeRoles(["admin"]), getAuditLogs);

module.exports = router;
