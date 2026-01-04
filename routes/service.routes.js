const express = require("express");
const {
  getServices,
  getVendorServices,
  createService,
} = require("../controllers/service.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all services
router.get("/", authenticateToken, getServices);

// Get vendor's services
router.get(
  "/vendor",
  authenticateToken,
  authorizeRoles("vendor"),
  getVendorServices
);

// Create a service
router.post("/", authenticateToken, authorizeRoles("vendor"), createService);

module.exports = router;
