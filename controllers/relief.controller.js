const { firestore } = require("../config/firebaseAdmin");

// Get relief for beneficiary
const getReliefForBeneficiary = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get approved beneficiaries for this user
    const beneficiaryDoc = await firestore
      .collection("beneficiaries")
      .doc(userId)
      .get();
    if (!beneficiaryDoc.exists) {
      return res
        .status(404)
        .json({ message: "Beneficiary not approved or found" });
    }

    const beneficiary = beneficiaryDoc.data();
    const eventId = beneficiary.eventId;

    // Get relief allocations for this beneficiary and event
    const reliefSnapshot = await firestore
      .collection("relief")
      .where("beneficiaryId", "==", userId)
      .where("eventId", "==", eventId)
      .get();

    const relief = [];
    reliefSnapshot.forEach((doc) => {
      relief.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(relief);
  } catch (error) {
    console.error("Error fetching relief for beneficiary:", error);
    res
      .status(500)
      .json({ message: "Error fetching relief", error: error.message });
  }
};

// Get relief categories
const getReliefByCategory = async (req, res) => {
  try {
    // In a real implementation, this would fetch from the database
    // For now, we'll return some mock categories
    const categories = [
      { id: 1, name: "Food", description: "Food assistance" },
      { id: 2, name: "Shelter", description: "Shelter and housing" },
      { id: 3, name: "Medical", description: "Medical assistance" },
      { id: 4, name: "Clothing", description: "Clothing and personal items" },
      { id: 5, name: "Education", description: "Educational support" },
    ];

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching relief categories:", error);
    res.status(500).json({
      message: "Error fetching relief categories",
      error: error.message,
    });
  }
};

module.exports = {
  getReliefForBeneficiary,
  getReliefByCategory,
};
