const { firestore } = require("../config/firebaseAdmin");

// Get notifications for current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRole = req.user.role;

    let notifications = [];

    if (userRole === "admin") {
      // Admins get notifications for disaster requests and approvals
      const notificationsSnapshot = await firestore
        .collection("notifications")
        .where("recipientType", "in", ["admin", "all"])
        .get();

      notificationsSnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort and limit results
      notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      notifications = notifications.slice(0, 20);
    } else {
      // Regular users get notifications targeted to them
      const notificationsSnapshot = await firestore
        .collection("notifications")
        .where("recipientId", "==", userId)
        .get();

      notificationsSnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Sort and limit results
      notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      notifications = notifications.slice(0, 20);
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.uid;

    const notificationRef = firestore
      .collection("notifications")
      .doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const notification = notificationDoc.data();

    // Verify that the notification belongs to the user (or user is admin)
    if (notification.recipientId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized to access this notification",
      });
    }

    await notificationRef.update({
      read: true,
      readAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get all unread notifications for the user
    const notificationsSnapshot = await firestore
      .collection("notifications")
      .where("recipientId", "==", userId)
      .where("read", "==", false)
      .get();

    // Update all notifications to read
    const batch = firestore.batch();
    notificationsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

// Create a notification (for internal use)
const createNotification = async (req, res) => {
  try {
    const { recipientId, recipientType, title, message, type } = req.body;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin users can create notifications",
      });
    }

    // Validate required fields
    if (!recipientId || !title || !message || !type) {
      return res.status(400).json({
        message: "Recipient ID, title, message, and type are required",
      });
    }

    const validTypes = [
      "disaster_request",
      "disaster_approved",
      "disaster_rejected",
      "allocation",
      "general",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message:
          "Invalid notification type. Valid types are: " +
          validTypes.join(", "),
      });
    }

    const notificationRef = await firestore.collection("notifications").add({
      recipientId,
      recipientType: recipientType || "user", // Default to user if not specified
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      readAt: null,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notificationId: notificationRef.id,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      message: "Error creating notification",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
};
