const express = require("express");
const { getServices } = require("../controllers/service.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all services
router.get("/", authenticateToken, getServices);

module.exports = router;
