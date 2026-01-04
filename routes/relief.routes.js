const express = require("express");
const {
  getReliefForBeneficiary,
  getReliefByCategory,
} = require("../controllers/relief.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get relief for beneficiary
router.get(
  "/beneficiary",
  authenticateToken,
  authorizeRoles("beneficiary"),
  getReliefForBeneficiary
);

// Get relief by category
router.get("/category", authenticateToken, getReliefByCategory);

module.exports = router;
