const { firestore } = require("../config/firebaseAdmin");

// Function to create a notification
const createNotification = async (
  recipientId,
  recipientType,
  title,
  message,
  type
) => {
  try {
    const notificationRef = await firestore.collection("notifications").add({
      recipientId,
      recipientType,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      readAt: null,
    });
    return notificationRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Submit a disaster request
const submitDisasterRequest = async (req, res) => {
  try {
    const { name, description, severity, location, estimatedAidNeeded } =
      req.body;
    const beneficiary = req.user;

    // Validate required fields
    if (!name || !description || !severity || !location) {
      return res.status(400).json({
        message: "Name, description, severity, and location are required",
      });
    }

    // Validate severity level
    const validSeverities = ["low", "medium", "high", "critical"];
    if (!validSeverities.includes(severity.toLowerCase())) {
      return res.status(400).json({
        message: "Severity must be one of: low, medium, high, critical",
      });
    }

    // Create disaster request in Firestore
    const disasterRequestRef = await firestore
      .collection("disaster_requests")
      .add({
        name: name.trim(),
        description: description.trim(),
        severity: severity.toLowerCase(),
        location: location.trim(),
        estimatedAidNeeded: estimatedAidNeeded
          ? parseFloat(estimatedAidNeeded)
          : null,
        requestedBy: beneficiary.uid,
        requestedByName: beneficiary.name,
        requestedByEmail: beneficiary.email,
        status: "pending", // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    // Create notification for admins about the new disaster request
    await createNotification(
      "all_admins", // Special ID for all admins
      "admin",
      "New Disaster Request Submitted",
      `${beneficiary.name} has submitted a new disaster request for ${name}. Please review and take action.`,
      "disaster_request"
    );

    res.status(201).json({
      message: "Disaster request submitted successfully",
      requestId: disasterRequestRef.id,
    });
  } catch (error) {
    console.error("Error submitting disaster request:", error);
    res.status(500).json({
      message: "Error submitting disaster request",
      error: error.message,
    });
  }
};

// Get all disaster requests
const getAllDisasterRequests = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin users can view all disaster requests",
      });
    }

    const requestsSnapshot = await firestore
      .collection("disaster_requests")
      .get();

    const requests = [];
    requestsSnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort requests by createdAt in descending order (most recent first)
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching disaster requests:", error);
    res.status(500).json({
      message: "Error fetching disaster requests",
      error: error.message,
    });
  }
};

// Get disaster requests by status
const getDisasterRequestsByStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin users can view disaster requests by status",
      });
    }

    const { status } = req.params;
    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "in_progress",
      "completed",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Valid statuses are: pending, approved, rejected, in_progress, completed",
      });
    }

    const requestsSnapshot = await firestore
      .collection("disaster_requests")
      .where("status", "==", status)
      .get();

    const requests = [];
    requestsSnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort requests by createdAt in descending order (most recent first)
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching disaster requests by status:", error);
    res.status(500).json({
      message: "Error fetching disaster requests by status",
      error: error.message,
    });
  }
};

// Update disaster request status (admin only)
const updateDisasterRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;
    const admin = req.user;

    // Check if user is admin
    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "Only admin users can update disaster request status",
      });
    }

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "in_progress",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Valid statuses are: pending, approved, rejected, in_progress, completed",
      });
    }

    const requestRef = firestore.collection("disaster_requests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return res.status(404).json({
        message: "Disaster request not found",
      });
    }

    // Get the current request data before updating
    const requestData = requestDoc.data();

    // Update the request status
    await requestRef.update({
      status: status,
      notes: notes || null,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.uid,
      updatedByName: admin.name,
    });

    // Create notification for the beneficiary about the status change
    await createNotification(
      requestData.requestedBy, // The user who submitted the request
      "user",
      `Disaster Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your disaster request for ${requestData.name} has been ${status}. ${
        notes ? "Notes: " + notes : ""
      }`,
      `disaster_${status}`
    );

    res.status(200).json({
      message: `Disaster request status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating disaster request status:", error);
    res.status(500).json({
      message: "Error updating disaster request status",
      error: error.message,
    });
  }
};

// Get disaster requests by beneficiary
const getMyDisasterRequests = async (req, res) => {
  try {
    const beneficiary = req.user;

    const requestsSnapshot = await firestore
      .collection("disaster_requests")
      .where("requestedBy", "==", beneficiary.uid)
      .get();

    const requests = [];
    requestsSnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort requests by createdAt in descending order (most recent first)
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching beneficiary's disaster requests:", error);
    res.status(500).json({
      message: "Error fetching disaster requests",
      error: error.message,
    });
  }
};

module.exports = {
  submitDisasterRequest,
  getAllDisasterRequests,
  getDisasterRequestsByStatus,
  updateDisasterRequestStatus,
  getMyDisasterRequests,
};
