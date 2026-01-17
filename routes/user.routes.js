const express = require("express");
const {
  getCurrentUser,
  updateUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/user.controller");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/me", authenticateToken, getCurrentUser);
router.put("/me", authenticateToken, updateUser);

// Admin routes
router.get("/", authenticateToken, authorizeRoles("admin"), getAllUsers);
router.get("/:id", authenticateToken, authorizeRoles("admin"), getUserById);
router.put(
  "/:id/role",
  authenticateToken,
  authorizeRoles("admin"),
  updateUserRole
);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteUser);

module.exports = router;
