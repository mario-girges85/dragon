// backend/middleware/auth.js

const jwt = require("jsonwebtoken");

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

module.exports = verifyToken;
