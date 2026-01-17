const { firestore } = require("../config/firebaseAdmin");

// Get all services
const getServices = async (req, res) => {
  try {
    const servicesSnapshot = await firestore.collection("services").get();

    const services = [];
    servicesSnapshot.forEach((doc) => {
      services.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

module.exports = {
  getServices,
};
