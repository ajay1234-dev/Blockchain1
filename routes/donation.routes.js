const express = require("express");
const {
  getDonations,
  getDonorDonations,
  createDonation,
} = require("../controllers/donation.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all donations
router.get("/", authenticateToken, authorizeRoles("admin"), getDonations);

// Get donor's donations
router.get("/donor", authenticateToken, getDonorDonations);

// Create a donation
router.post("/", authenticateToken, authorizeRoles("donor"), createDonation);

module.exports = router;
