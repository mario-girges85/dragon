// backend/index.js

const express = require("express");
const cors = require("cors");
const path = require("path");

// --- Database & Models ---
const sequelize = require("./util/db");
// NEW: Import all models to ensure Sequelize is aware of them before sync
require("./models/user");
require("./models/order");

// --- Routes ---
const usersRouter = require("./routes/users");
const orderRouter = require("./routes/order");

const app = express();
const port = 3000;

// --- Core Middleware ---
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// NEW: Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
