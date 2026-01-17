const express = require("express");
const {
  submitDisasterRequest,
  getAllDisasterRequests,
  getDisasterRequestsByStatus,
  updateDisasterRequestStatus,
  getMyDisasterRequests,
} = require("../controllers/disasterRequest.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Beneficiary routes - Submit disaster request
router.post(
  "/",
  authenticateToken,
  authorizeRoles("beneficiary"),
  submitDisasterRequest
);

// Beneficiary route - Get their own disaster requests
router.get(
  "/my-requests",
  authenticateToken,
  authorizeRoles("beneficiary"),
  getMyDisasterRequests
);

// Admin routes - Get all disaster requests
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllDisasterRequests
);

// Admin route - Get disaster requests by status
router.get(
  "/status/:status",
  authenticateToken,
  authorizeRoles("admin"),
  getDisasterRequestsByStatus
);

// Admin route - Update disaster request status
router.put(
  "/:requestId/status",
  authenticateToken,
  authorizeRoles("admin"),
  updateDisasterRequestStatus
);

module.exports = router;
