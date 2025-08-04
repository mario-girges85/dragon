// backend/routes/order.js

const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/order");
const verifyToken = require("../Controllers/tokenVerify"); // REFACTORED: Import middleware

// Apply authentication middleware to all order routes
router.use(verifyToken);

// POST /api/orders/new - Create a new order
router.post("/new", orderController.newOrder);

// GET /api/orders - Get all orders
router.get("/", orderController.getAllOrders);

// GET /api/orders/:id - Get order by ID
router.get("/:id", orderController.getOrderById);

// PUT /api/orders/:id/status - Update order status
router.put("/:id/status", orderController.updateOrderStatus);

module.exports = router;
