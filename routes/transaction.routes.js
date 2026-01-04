const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  logTransaction,
  getUserTransactionHistory,
  getAdminTransactionAudit,
} = require("../controllers/transaction.controller");

// Log a blockchain transaction (requires authentication)
router.post("/", authenticateToken, logTransaction);

// Get user's transaction history (requires authentication)
router.get("/user", authenticateToken, getUserTransactionHistory);

// Get admin transaction audit (admin only)
router.get(
  "/admin",
  authenticateToken,
  authorizeRoles("admin"),
  getAdminTransactionAudit
);

module.exports = router;
