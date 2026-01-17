const express = require("express");
const {
  getWalletBalance,
  initiateTokenTransfer,
  createDisasterEvent,
  approveBeneficiary,
} = require("../controllers/blockchain.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Wallet balance
router.get("/balance/:address", authenticateToken, getWalletBalance);

// Token transfer
router.post("/transfer", authenticateToken, initiateTokenTransfer);

// Admin functions for disaster management
router.post(
  "/disaster",
  authenticateToken,
  authorizeRoles("admin"),
  createDisasterEvent
);
router.post(
  "/approve/beneficiary",
  authenticateToken,
  authorizeRoles("admin"),
  approveBeneficiary
);

module.exports = router;
