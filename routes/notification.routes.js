const express = require("express");
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
} = require("../controllers/notification.controller");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get notifications for current user
router.get("/", authenticateToken, getNotifications);

// Mark a notification as read
router.put("/:notificationId/read", authenticateToken, markNotificationAsRead);

// Mark all notifications as read
router.put("/mark-all-read", authenticateToken, markAllNotificationsAsRead);

module.exports = router;
