const { getFirestore } = require("../config/firebase");

// Get all services
const getServices = async (req, res) => {
  try {
    const firestore = getFirestore();
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

// Get vendor's services
const getVendorServices = async (req, res) => {
  try {
    const firestore = getFirestore();
    const userId = req.user.uid;

    // Get vendor's services
    const servicesSnapshot = await firestore
      .collection("services")
      .where("vendorId", "==", userId)
      .get();

    const services = [];
    servicesSnapshot.forEach((doc) => {
      services.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching vendor services:", error);
    res
      .status(500)
      .json({
        message: "Error fetching vendor services",
        error: error.message,
      });
  }
};

// Create a service
const createService = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const userId = req.user.uid;

    if (!name || !description || !price) {
      return res
        .status(400)
        .json({ message: "Name, description, and price are required" });
    }

    const firestore = getFirestore();

    // Create the service
    const serviceDoc = await firestore.collection("services").add({
      vendorId: userId,
      name,
      description,
      price: parseFloat(price),
      category: category || "general",
      status: "active",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Service created successfully",
      serviceId: serviceDoc.id,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res
      .status(500)
      .json({ message: "Error creating service", error: error.message });
  }
};

module.exports = {
  getServices,
  getVendorServices,
  createService,
};
