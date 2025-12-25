// firebase/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { auth, admin } = require("./config");
const UserManager = require("./userManager");
const DisasterManager = require("./disasterManager");
const VendorManager = require("./vendorManager");
const CategoryManager = require("./categoryManager");
const EthereumSync = require("./ethereumSync");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware using Firebase Auth
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    const validation = await UserManager.validateUserRole(
      req.user.uid,
      allowedRoles
    );
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }
    next();
  };
};

// Initialize Ethereum sync (optional, only if environment variables are set)
let ethereumSync = null;
if (
  process.env.ETHEREUM_PROVIDER_URL &&
  process.env.STABLECOIN_CONTRACT_ADDRESS &&
  process.env.MANAGER_CONTRACT_ADDRESS
) {
  ethereumSync = new EthereumSync(
    process.env.ETHEREUM_PROVIDER_URL,
    process.env.STABLECOIN_CONTRACT_ADDRESS,
    process.env.MANAGER_CONTRACT_ADDRESS
  );

  // Initialize the sync service
  ethereumSync
    .initialize()
    .then(() => {
      console.log("Ethereum sync service initialized");

      // Start listening for real-time events
      ethereumSync.startEventListener();
    })
    .catch((error) => {
      console.error("Failed to initialize Ethereum sync:", error);
    });
}

// Routes

// User routes
app.post("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const result = await UserManager.createUserProfile(req.user.uid, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error in /api/users/profile:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const profile = await UserManager.getUserProfile(req.user.uid);
    res.json(profile);
  } catch (error) {
    console.error("Error in /api/users/profile GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/ethereum/:address", authenticateToken, async (req, res) => {
  try {
    const user = await UserManager.getUserByEthereumAddress(req.params.address);
    res.json(user);
  } catch (error) {
    console.error("Error in /api/users/ethereum GET:", error);
    res.status(500).json({ error: error.message });
  }
});

// Disaster routes
app.post(
  "/api/disasters",
  authenticateToken,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    try {
      const result = await DisasterManager.createDisaster(
        req.body,
        req.user.uid
      );
      res.json(result);
    } catch (error) {
      console.error("Error in /api/disasters POST:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.get("/api/disasters", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const disasters = await DisasterManager.getActiveDisasters(limit);
    res.json(disasters);
  } catch (error) {
    console.error("Error in /api/disasters GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/disasters/:id", async (req, res) => {
  try {
    const disaster = await DisasterManager.getDisaster(req.params.id);
    res.json(disaster);
  } catch (error) {
    console.error("Error in /api/disasters/:id GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put(
  "/api/disasters/:id",
  authenticateToken,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    try {
      const result = await DisasterManager.updateDisaster(
        req.params.id,
        req.body,
        req.user.uid
      );
      res.json(result);
    } catch (error) {
      console.error("Error in /api/disasters/:id PUT:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Vendor routes
app.post(
  "/api/vendors",
  authenticateToken,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    try {
      const result = await VendorManager.registerVendor(req.body, req.user.uid);
      res.json(result);
    } catch (error) {
      console.error("Error in /api/vendors POST:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.put(
  "/api/vendors/:id/approve",
  authenticateToken,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    try {
      const result = await VendorManager.approveVendor(
        req.params.id,
        req.user.uid
      );
      res.json(result);
    } catch (error) {
      console.error("Error in /api/vendors/:id/approve PUT:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.get("/api/vendors/:id", authenticateToken, async (req, res) => {
  try {
    const vendor = await VendorManager.getVendor(req.params.id);
    res.json(vendor);
  } catch (error) {
    console.error("Error in /api/vendors/:id GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get(
  "/api/vendors/services/:service",
  authenticateToken,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const vendors = await VendorManager.getWhitelistedVendorsByService(
        req.params.service,
        limit
      );
      res.json(vendors);
    } catch (error) {
      console.error("Error in /api/vendors/services/:service GET:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.get(
  "/api/vendors/status/:status",
  authenticateToken,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const vendors = await VendorManager.getVendorsByStatus(
        req.params.status,
        limit
      );
      res.json(vendors);
    } catch (error) {
      console.error("Error in /api/vendors/status/:status GET:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Category routes
app.post(
  "/api/categories",
  authenticateToken,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    try {
      const result = await CategoryManager.createCategory(
        req.body,
        req.user.uid
      );
      res.json(result);
    } catch (error) {
      console.error("Error in /api/categories POST:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.get("/api/categories", authenticateToken, async (req, res) => {
  try {
    const categories = await CategoryManager.getActiveCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error in /api/categories GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories/:id", authenticateToken, async (req, res) => {
  try {
    const category = await CategoryManager.getCategory(req.params.id);
    res.json(category);
  } catch (error) {
    console.error("Error in /api/categories/:id GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories/name/:name", authenticateToken, async (req, res) => {
  try {
    const category = await CategoryManager.getCategoryByName(req.params.name);
    res.json(category);
  } catch (error) {
    console.error("Error in /api/categories/name/:name GET:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put(
  "/api/categories/:id",
  authenticateToken,
  requireRole(["admin", "operator"]),
  async (req, res) => {
    try {
      const result = await CategoryManager.updateCategory(
        req.params.id,
        req.body,
        req.user.uid
      );
      res.json(result);
    } catch (error) {
      console.error("Error in /api/categories/:id PUT:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Ethereum sync routes (admin only)
app.post(
  "/api/sync/ethereum",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      if (!ethereumSync) {
        return res.status(500).json({ error: "Ethereum sync not configured" });
      }

      const { fromBlock, toBlock } = req.body;
      await ethereumSync.syncEvents(fromBlock, toBlock || "latest");

      res.json({
        success: true,
        message: "Ethereum events synced successfully",
      });
    } catch (error) {
      console.error("Error in /api/sync/ethereum POST:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      firestore: "connected",
      auth: "connected",
      ethereumSync: !!ethereumSync,
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Disaster Relief Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
