// backend/controllers/orderController.js

const path = require("path");
const multer = require("multer");
const fs = require("fs");
const Order = require("../models/order"); // FIXED: Use the correct, standardized model name 'Order'

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."), false);
    }
  },
});

// Create new order
exports.newOrder = [
  upload.single("packageImage"), // Use multer as middleware for this specific route
  async (req, res) => {
    let packageImagePath = null;
    let packageImageName = null;

    try {
      // FIXED: Added file-saving logic
      if (req.file) {
        const timestamp = Date.now();
        const ext = path.extname(req.file.originalname);
        packageImageName = `package_${timestamp}${ext}`;

        const uploadsDir = path.join("uploads", "package");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        packageImagePath = path.join(uploadsDir, packageImageName);
        fs.writeFileSync(packageImagePath, req.file.buffer);
      }

      const {
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        address,
        packageType,
        weight,
        notes,
        isCollection,
        collectionPrice,
      } = req.body;

      const orderData = {
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        address,
        packageType,
        weight: parseFloat(weight),
        notes: notes || null,
        isCollection: isCollection === "true",
        collectionPrice:
          isCollection === "true" ? parseFloat(collectionPrice) : null,
        packageImageUrl: packageImagePath,
        packageImageName: packageImageName,
        userId: req.user.id, // Comes from verifyToken middleware
      };

      const newOrder = await Order.create(orderData);

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: newOrder,
      });
    } catch (error) {
      // FIXED: Added robust error handling to prevent server crashes
      console.error("Error creating order:", error);

      // If an error occurs after a file was saved, delete the file
      if (packageImagePath && fs.existsSync(packageImagePath)) {
        fs.unlinkSync(packageImagePath);
      }

      res.status(500).json({
        success: false,
        message: "Failed to create order.",
        error: error.message,
      });
    }
  },
];

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status." });
  }
};
