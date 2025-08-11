// backend/controllers/orderController.js

const path = require("path");
const multer = require("multer");
const fs = require("fs");
const Order = require("../models/order");
const User = require("../models/user"); // Import the User model
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
        weight: weight ? parseFloat(weight) : null,
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
    let whereClause = {};

    // If user is delivery, only show orders assigned to them
    if (req.user.role === "delivery") {
      whereClause.deliveryUserId = req.user.id;
    }

    const orders = await Order.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User, // This will now correctly attach the data as a "User" property
          as: "User",
          attributes: ["name", "profile_image"],
        },
        {
          model: User,
          as: "DeliveryUser",
          attributes: ["name", "profile_image"],
        },
      ],
    });

    // Convert profile images to base64 for each order's user and delivery user
    const ordersWithUserImages = orders.map((order) => {
      const orderObj = order.toJSON();

      // Handle creator user image
      if (
        orderObj.User &&
        orderObj.User.profile_image &&
        fs.existsSync(orderObj.User.profile_image)
      ) {
        try {
          const imageData = fs.readFileSync(orderObj.User.profile_image);
          orderObj.User.profile_image_base64 = `data:image/jpeg;base64,${imageData.toString(
            "base64"
          )}`;
        } catch (imgErr) {
          console.error("Error reading profile image:", imgErr);
          orderObj.User.profile_image_base64 = null;
        }
      } else {
        orderObj.User.profile_image_base64 = null;
      }

      // Handle delivery user image
      if (
        orderObj.DeliveryUser &&
        orderObj.DeliveryUser.profile_image &&
        fs.existsSync(orderObj.DeliveryUser.profile_image)
      ) {
        try {
          const imageData = fs.readFileSync(
            orderObj.DeliveryUser.profile_image
          );
          orderObj.DeliveryUser.profile_image_base64 = `data:image/jpeg;base64,${imageData.toString(
            "base64"
          )}`;
        } catch (imgErr) {
          console.error("Error reading delivery user profile image:", imgErr);
          orderObj.DeliveryUser.profile_image_base64 = null;
        }
      } else if (orderObj.DeliveryUser) {
        orderObj.DeliveryUser.profile_image_base64 = null;
      }

      return orderObj;
    });

    res.status(200).json({ success: true, orders: ordersWithUserImages });
  } catch (error) {
    console.error("Error fetching orders with user data:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders." });
  }
};

// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id; // From verifyToken middleware

    // Check if user is requesting their own orders or is admin
    if (requestingUserId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "لا يمكنك الوصول إلى طلبات مستخدم آخر",
      });
    }

    const orders = await Order.findAll({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["name", "profile_image"],
        },
      ],
    });

    // Convert profile images to base64 for each order's user
    const ordersWithUserImages = orders.map((order) => {
      const orderObj = order.toJSON();
      if (
        orderObj.User &&
        orderObj.User.profile_image &&
        fs.existsSync(orderObj.User.profile_image)
      ) {
        try {
          const imageData = fs.readFileSync(orderObj.User.profile_image);
          orderObj.User.profile_image_base64 = `data:image/jpeg;base64,${imageData.toString(
            "base64"
          )}`;
        } catch (imgErr) {
          console.error("Error reading profile image:", imgErr);
          orderObj.User.profile_image_base64 = null;
        }
      } else {
        orderObj.User.profile_image_base64 = null;
      }
      return orderObj;
    });

    res.status(200).json({ success: true, orders: ordersWithUserImages });
  } catch (error) {
    console.error("Error fetching orders by user ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user orders." });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const requestingUserId = req.user.id; // From verifyToken middleware

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "profile_image", "email", "phone"],
        },
        {
          model: User,
          as: "DeliveryUser",
          attributes: ["name", "profile_image", "email", "phone"],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Check if user is requesting their own order or is admin
    if (order.userId !== requestingUserId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "لا يمكنك الوصول إلى طلب آخر",
      });
    }

    const orderObj = order.toJSON();

    // Convert user profile image to base64
    if (
      orderObj.User &&
      orderObj.User.profile_image &&
      fs.existsSync(orderObj.User.profile_image)
    ) {
      try {
        const imageData = fs.readFileSync(orderObj.User.profile_image);
        orderObj.User.profile_image_base64 = `data:image/jpeg;base64,${imageData.toString(
          "base64"
        )}`;
      } catch (imgErr) {
        console.error("Error reading profile image:", imgErr);
        orderObj.User.profile_image_base64 = null;
      }
    } else {
      orderObj.User.profile_image_base64 = null;
    }

    // Convert delivery user profile image to base64
    if (
      orderObj.DeliveryUser &&
      orderObj.DeliveryUser.profile_image &&
      fs.existsSync(orderObj.DeliveryUser.profile_image)
    ) {
      try {
        const imageData = fs.readFileSync(orderObj.DeliveryUser.profile_image);
        orderObj.DeliveryUser.profile_image_base64 = `data:image/jpeg;base64,${imageData.toString(
          "base64"
        )}`;
      } catch (imgErr) {
        console.error("Error reading delivery user profile image:", imgErr);
        orderObj.DeliveryUser.profile_image_base64 = null;
      }
    } else if (orderObj.DeliveryUser) {
      orderObj.DeliveryUser.profile_image_base64 = null;
    }

    // Convert package image to base64 if it exists
    if (orderObj.packageImageUrl && fs.existsSync(orderObj.packageImageUrl)) {
      try {
        const packageImageData = fs.readFileSync(orderObj.packageImageUrl);
        orderObj.packageImage = `data:image/jpeg;base64,${packageImageData.toString(
          "base64"
        )}`;
      } catch (imgErr) {
        console.error("Error reading package image:", imgErr);
        orderObj.packageImage = null;
      }
    } else {
      orderObj.packageImage = null;
    }

    res.status(200).json({ success: true, order: orderObj });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
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

// Update delivery status by delivery personnel
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryNotes } = req.body;

    // Check if user is delivery personnel
    if (req.user.role !== "delivery") {
      return res.status(403).json({
        success: false,
        message: "Only delivery personnel can update delivery status.",
      });
    }

    // Find the order
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order is assigned to this delivery user
    if (order.deliveryUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update orders assigned to you.",
      });
    }

    // Validate status
    const validStatuses = ["delivered", "returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Only 'delivered' or 'returned' are allowed.",
      });
    }

    // If status is returned, delivery notes are required
    if (
      status === "returned" &&
      (!deliveryNotes || deliveryNotes.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery notes are required when marking order as not delivered.",
      });
    }

    // Update the order
    order.status = status;
    if (deliveryNotes) {
      order.deliveryNotes = deliveryNotes.trim();
    }
    await order.save();

    // Get the updated order with user information
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "profile_image"],
        },
        {
          model: User,
          as: "DeliveryUser",
          attributes: ["name", "profile_image"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update delivery status.",
    });
  }
};

// Assign order to delivery personnel
exports.assignOrderToDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryUserId } = req.body;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can assign orders to delivery personnel.",
      });
    }

    // Find the order
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify the delivery user exists and has delivery role
    const deliveryUser = await User.findByPk(deliveryUserId);
    if (!deliveryUser) {
      return res.status(404).json({
        success: false,
        message: "Delivery user not found",
      });
    }

    if (deliveryUser.role !== "delivery") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a delivery personnel",
      });
    }

    // Determine the next status based on current status
    let nextStatus = order.status;
    switch (order.status) {
      case "pending":
        nextStatus = "confirmed";
        break;
      case "confirmed":
        nextStatus = "picked_up";
        break;
      case "picked_up":
        nextStatus = "in_transit";
        break;
      case "in_transit":
        nextStatus = "delivered";
        break;
      default:
        // For delivered, cancelled, or returned orders, don't change status
        break;
    }

    // Update the order with delivery assignment and status
    order.deliveryUserId = deliveryUserId;
    order.status = nextStatus;
    await order.save();

    // Get the updated order with user information
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "profile_image"],
        },
        {
          model: User,
          as: "DeliveryUser",
          attributes: ["name", "profile_image"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Order assigned to delivery personnel and status updated to ${nextStatus}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error assigning order to delivery:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign order to delivery personnel.",
    });
  }
};
