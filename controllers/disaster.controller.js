const { firestore } = require("../config/firebaseAdmin");

// Get all disasters
const getDisasters = async (req, res) => {
  try {
    const disastersSnapshot = await firestore.collection("disasters").get();

    const disasters = [];
    for (const doc of disastersSnapshot.docs) {
      const disasterData = doc.data();

      // Get the creator's name if createdBy exists
      let createdByName = "Unknown";
      if (disasterData.createdBy) {
        try {
          const userDoc = await firestore
            .collection("users")
            .doc(disasterData.createdBy)
            .get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            createdByName = userData.name || userData.email || "Unknown";
          }
        } catch (error) {
          console.error(
            "Error fetching user data for disaster creator:",
            error
          );
          createdByName = "Unknown";
        }
      }

      disasters.push({
        id: doc.id,
        ...disasterData,
        createdBy: createdByName, // Replace UID with name
      });
    }

    res.status(200).json(disasters);
  } catch (error) {
    console.error("Error fetching disasters:", error);
    res
      .status(500)
      .json({ message: "Error fetching disasters", error: error.message });
  }
};

// Get active disasters
const getActiveDisasters = async (req, res) => {
  try {
    const disastersSnapshot = await firestore
      .collection("disasters")
      .where("status", "==", "active")
      .get();

    const disasters = [];
    for (const doc of disastersSnapshot.docs) {
      const disasterData = doc.data();

      // Get the creator's name if createdBy exists
      let createdByName = "Unknown";
      if (disasterData.createdBy) {
        try {
          const userDoc = await firestore
            .collection("users")
            .doc(disasterData.createdBy)
            .get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            createdByName = userData.name || userData.email || "Unknown";
          }
        } catch (error) {
          console.error(
            "Error fetching user data for disaster creator:",
            error
          );
          createdByName = "Unknown";
        }
      }

      disasters.push({
        id: doc.id,
        ...disasterData,
        createdBy: createdByName, // Replace UID with name
      });
    }

    res.status(200).json(disasters);
  } catch (error) {
    console.error("Error fetching active disasters:", error);
    res.status(500).json({
      message: "Error fetching active disasters",
      error: error.message,
    });
  }
};

module.exports = {
  getDisasters,
  getActiveDisasters,
};
