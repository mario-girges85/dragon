// backend/routes/order.js

const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/order");
const {
  verifyToken,
  excludeDelivery,
  verifyAdmin,
} = require("../Controllers/tokenVerify"); // REFACTORED: Import middleware

// Apply authentication middleware to all order routes
router.use(verifyToken);

// POST /api/orders/new - Create a new order (exclude delivery users)
router.post("/new", excludeDelivery, orderController.newOrder);

// GET /api/orders/getall - Get all orders
router.get("/getall", orderController.getAllOrders);

// GET /api/orders/user/:userId - Get orders by user ID
router.get("/user/:userId", orderController.getOrdersByUserId);

// GET /api/orders/:id - Get order by ID
router.get("/:id", orderController.getOrderById);

// PUT /api/orders/:id/status - Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// PUT /api/orders/bulk/assign-delivery - Bulk assign multiple orders to a delivery personnel (admin only)
router.put(
  "/bulk/assign-delivery",
  verifyAdmin,
  orderController.bulkAssignOrdersToDelivery
);

// PUT /api/orders/:id/assign-delivery - Assign order to delivery personnel (admin only)
router.put(
  "/:id/assign-delivery",
  verifyAdmin,
  orderController.assignOrderToDelivery
);

// Alias: PUT /api/orders/assign-delivery/bulk - supports alternate path ordering
router.put(
  "/assign-delivery/bulk",
  verifyAdmin,
  orderController.bulkAssignOrdersToDelivery
);

// PUT /api/orders/:id/delivery-status - Update delivery status by delivery personnel
router.put("/:id/delivery-status", orderController.updateDeliveryStatus);

// PUT /api/orders/:id/cancel - Cancel order (admin or order creator)
router.put("/:id/cancel", orderController.cancelOrder);

// DELETE /api/orders/:id - Delete order (admin or order creator)
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
