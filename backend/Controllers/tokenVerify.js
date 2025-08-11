// backend/middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/user");

// JWT Secret - should be in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. Token is required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adds the user payload (e.g., id, email) to the request object
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// Middleware to verify if user is admin
const verifyAdmin = async (req, res, next) => {
  try {
    // First verify the token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. Token is required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check role from JWT token
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can assign orders to delivery personnel.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// Middleware to verify if user is NOT a delivery user
const excludeDelivery = async (req, res, next) => {
  try {
    // First verify the token
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. Token is required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Check role from JWT token
    if (decoded.role === "delivery") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Delivery users cannot perform this action.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

module.exports = { verifyToken, verifyAdmin, excludeDelivery };
