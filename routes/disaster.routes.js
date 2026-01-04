const express = require("express");
const {
  getDisasters,
  getActiveDisasters,
} = require("../controllers/disaster.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all disasters
router.get("/", authenticateToken, getDisasters);

// Get active disasters
router.get("/active", authenticateToken, getActiveDisasters);

module.exports = router;
