const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const firebaseConfig = require("./config/firebaseAdmin");
const ethereumConfig = require("./config/ethereum");
require("./controllers/firebase.controller");

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const blockchainRoutes = require("./routes/blockchain.routes");
const disasterRoutes = require("./routes/disaster.routes");
const donationRoutes = require("./routes/donation.routes");
const reliefRoutes = require("./routes/relief.routes");
const transactionRoutes = require("./routes/transaction.routes");
const serviceRoutes = require("./routes/service.routes");
const walletRoutes = require("./routes/wallet.routes");
const disasterRequestRoutes = require("./routes/disasterRequest.routes");
const notificationRoutes = require("./routes/notification.routes");
const settingsRoutes = require("./routes/settings.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Specific rate limiters for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login/register attempts per windowMs
  message: {
    error: "Too many authentication attempts",
    message: "Too many authentication attempts, please try again later",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

const walletLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 wallet link attempts per windowMs
  message: {
    error: "Too many wallet link attempts",
    message: "Too many wallet link attempts, please try again later",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

// Apply specific rate limiters to sensitive routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/wallet/link", walletLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static("public"));

// Initialize Firebase

// Initialize Ethereum
ethereumConfig.initializeEthereum();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/disaster", disasterRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/relief", reliefRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/disaster-request", disasterRequestRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/settings", settingsRoutes);

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
