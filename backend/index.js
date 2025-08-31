// backend/index.js

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// --- Database & Models ---
const sequelize = require("./util/db");
// NEW: Import all models to ensure Sequelize is aware of them before sync
const User = require("./models/user");
const Order = require("./models/order");

// --- NEW: Define model associations ---
// This tells Sequelize a User can have many Orders (as creator)
User.hasMany(Order, { foreignKey: "userId", as: "User" });
// This tells Sequelize an Order belongs to one User (creator)
Order.belongsTo(User, { foreignKey: "userId", as: "User" });

// This tells Sequelize a User can have many Orders (as delivery person)
User.hasMany(Order, { foreignKey: "deliveryUserId", as: "DeliveryUser" });
// This tells Sequelize an Order belongs to one User (delivery person)
Order.belongsTo(User, { foreignKey: "deliveryUserId", as: "DeliveryUser" });
// ------------------------------------
// --- Routes ---

const usersRouter = require("./routes/users");
const orderRouter = require("./routes/order");

const app = express();
const port = process.env.PORT || 3000;

// --- Core Middleware ---
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.vercel.app", "http://localhost:5173"]
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// NEW: Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Shipping Management API",
    version: "1.0.0",
    status: "running",
  });
});

// --- API Routes ---
app.use("/users", usersRouter);
app.use("/orders", orderRouter);

// --- Server & DB Sync ---
app.listen(port, async () => {
  try {
    await sequelize.sync(); // BEST PRACTICE: Sync database on server start
    console.log("Database synchronized successfully.");
    console.log(`Server is running on http://localhost:${port}`);
  } catch (error) {
    console.error("Database synchronization failed:", error);
  }
});
