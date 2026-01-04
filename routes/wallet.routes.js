const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { linkWallet, getWalletInfo } = require("../controllers/wallet.controller");

// Link wallet to user account (requires authentication)
router.post("/link", authenticateToken, linkWallet);

// Get user's wallet information (requires authentication)
router.get("/me", authenticateToken, getWalletInfo);

module.exports = router;