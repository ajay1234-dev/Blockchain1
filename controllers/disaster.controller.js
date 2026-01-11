const { firestore } = require("../config/firebaseAdmin");

// Get all disasters
const getDisasters = async (req, res) => {
  try {
    const disastersSnapshot = await firestore.collection("disasters").get();

    const disasters = [];
    disastersSnapshot.forEach((doc) => {
      disasters.push({
        id: doc.id,
        ...doc.data(),
      });
    });

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
    disastersSnapshot.forEach((doc) => {
      disasters.push({
        id: doc.id,
        ...doc.data(),
      });
    });

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
