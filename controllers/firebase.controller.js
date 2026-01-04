const { getFirestore } = require("../config/firebase");

// Auto-create collections by ensuring they exist
const ensureCollections = async () => {
  const firestore = getFirestore();

  // Create sample documents to ensure collections exist
  const collections = [
    "users",
    "disasters",
    "donations",
    "transactions",
    "vendors",
    "beneficiaries",
    "audit_logs",
  ];

  for (const collectionName of collections) {
    // Add a temporary document and then delete it to ensure collection exists
    const tempDoc = await firestore
      .collection(collectionName)
      .add({ temp: true });
    await tempDoc.delete();
  }

  console.log("Firestore collections ensured");
};

// Initialize collections on startup
ensureCollections().catch(console.error);

module.exports = {
  ensureCollections,
};
