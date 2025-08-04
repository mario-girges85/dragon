const User = require("../models/user");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// Use memory storage to temporarily hold the file
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/heic"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
});

// JWT Secret - should match the one in users.js
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.body.token;

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Create new order endpoint
exports.newOrder = [
  upload.single("packageImage"), // Handle file upload
  verifyToken, // Verify user authentication
  async (req, res) => {
    try {
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

      // Validate required fields
      const requiredFields = {
        senderName: "اسم المرسل مطلوب",
        senderPhone: "رقم هاتف المرسل مطلوب",
        receiverName: "اسم المستلم مطلوب",
        receiverPhone: "رقم هاتف المستلم مطلوب",
        address: "العنوان مطلوب",
        packageType: "نوع الطرد مطلوب",
        weight: "وزن الطرد مطلوب",
      };

      const missingFields = [];
      for (const [field, message] of Object.entries(requiredFields)) {
        if (!req.body[field] || !req.body[field].toString().trim()) {
          missingFields.push(message);
        }
      }

      // Validate collection price if collection is enabled
      if (isCollection === "true" || isCollection === true) {
        if (!collectionPrice || parseFloat(collectionPrice) <= 0) {
          missingFields.push("سعر التحصيل مطلوب عند تفعيل التحصيل");
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "بيانات مطلوبة مفقودة",
          errors: missingFields,
        });
      }

      // Validate weight
      const weightValue = parseFloat(weight);
      if (isNaN(weightValue) || weightValue <= 0) {
        return res.status(400).json({
          success: false,
          message: "وزن الطرد يجب أن يكون رقم صحيح أكبر من صفر",
        });
      }

      // Validate phone numbers (basic validation)
      const phoneRegex = /^[\+]?[0-9\-\(\)\ ]+$/;
      if (!phoneRegex.test(senderPhone) || !phoneRegex.test(receiverPhone)) {
        return res.status(400).json({
          success: false,
          message: "رقم الهاتف غير صحيح",
        });
      }

      // Handle package image upload
      let packageImagePath = null;
      let packageImageName = null;

      if (req.file) {
        const timestamp = Date.now();
        const ext = path.extname(req.file.originalname);
        packageImageName = `package_${timestamp}${ext}`;
        packageImagePath = path.join("uploads", "package", packageImageName);

        // Ensure uploads directory exists
        const packagesDir = path.join("uploads", "package");
        if (!fs.existsSync(packagesDir)) {
          fs.mkdirSync(packagesDir, { recursive: true });
        }

        // Write file to disk
        fs.writeFileSync(packageImagePath, req.file.buffer);
      }

      // Get the DeliveryOrder model (assuming it's properly set up in your models)
      const DeliveryOrder = require("../models/deliveryOrder"); // Adjust path as needed

      // Create the order
      const orderData = {
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        address: address.trim(),
        packageType: packageType.trim(),
        weight: weightValue,
        notes: notes ? notes.trim() : null,
        isCollection: isCollection === "true" || isCollection === true,
        collectionPrice:
          isCollection === "true" || isCollection === true
            ? parseFloat(collectionPrice)
            : null,
        packageImageUrl: packageImagePath,
        packageImageName: packageImageName,
        status: "pending",
        // You can add userId if you want to track which user created the order
        userId: req.user.id,
      };

      const newOrder = await DeliveryOrder.create(orderData);

      // Return success response
      res.status(201).json({
        success: true,
        message: "تم إنشاء الطلب بنجاح",
        order: {
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          status: newOrder.status,
          senderName: newOrder.senderName,
          receiverName: newOrder.receiverName,
          createdAt: newOrder.createdAt,
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);

      // If there was an error and we uploaded a file, clean it up
      if (req.file && packageImagePath && fs.existsSync(packageImagePath)) {
        try {
          fs.unlinkSync(packageImagePath);
        } catch (unlinkError) {
          console.error("Error cleaning up uploaded file:", unlinkError);
        }
      }

      // Handle Sequelize validation errors
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "خطأ في البيانات المدخلة",
          errors: validationErrors,
        });
      }

      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء إنشاء الطلب",
        error: error.message,
      });
    }
  },
];

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const DeliveryOrder = require("../models/deliveryOrder");

    const orders = await DeliveryOrder.findAll({
      order: [["createdAt", "DESC"]],
    });

    // Convert package images to base64 if they exist
    const ordersWithImages = orders.map((order) => {
      const orderObj = order.toJSON();

      if (orderObj.packageImageUrl && fs.existsSync(orderObj.packageImageUrl)) {
        try {
          const imageData = fs.readFileSync(orderObj.packageImageUrl);
          orderObj.packageImageBase64 = imageData.toString("base64");
        } catch (imgErr) {
          console.error("Error reading package image:", imgErr);
          orderObj.packageImageBase64 = null;
        }
      } else {
        orderObj.packageImageBase64 = null;
      }

      return orderObj;
    });

    res.status(200).json({
      success: true,
      orders: ordersWithImages,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الطلبات",
      error: error.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const DeliveryOrder = require("../models/deliveryOrder");
    const { id } = req.params;

    const order = await DeliveryOrder.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    const orderObj = order.toJSON();

    // Add package image as base64 if exists
    if (orderObj.packageImageUrl && fs.existsSync(orderObj.packageImageUrl)) {
      try {
        const imageData = fs.readFileSync(orderObj.packageImageUrl);
        orderObj.packageImageBase64 = imageData.toString("base64");
      } catch (imgErr) {
        console.error("Error reading package image:", imgErr);
        orderObj.packageImageBase64 = null;
      }
    } else {
      orderObj.packageImageBase64 = null;
    }

    res.status(200).json({
      success: true,
      order: orderObj,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الطلب",
      error: error.message,
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const DeliveryOrder = require("../models/deliveryOrder");
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "picked_up",
      "in_transit",
      "delivered",
      "cancelled",
      "returned",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "حالة الطلب غير صحيحة",
      });
    }

    const order = await DeliveryOrder.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير موجود",
      });
    }

    // Update status and delivery date if delivered
    const updateData = { status };
    if (status === "delivered") {
      updateData.actualDeliveryDate = new Date();
    }

    await order.update(updateData);

    res.status(200).json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        actualDeliveryDate: order.actualDeliveryDate,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث حالة الطلب",
      error: error.message,
    });
  }
};
