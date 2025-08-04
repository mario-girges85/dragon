const { DataTypes } = require("sequelize");
const sequelize = require("../util/db");

const DeliveryOrder = sequelize.define(
  "DeliveryOrder",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Sender information
    senderName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
      comment: "اسم المرسل",
    },

    senderPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^[\+]?[0-9\-\(\)\ ]+$/,
      },
      comment: "رقم هاتف المرسل",
    },

    // Receiver information
    receiverName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
      comment: "اسم المستلم",
    },

    receiverPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^[\+]?[0-9\-\(\)\ ]+$/,
      },
      comment: "رقم هاتف المستلم",
    },

    // Delivery address
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 500],
      },
      comment: "العنوان",
    },

    packageType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      comment: "نوع الطرد",
    },

    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      validate: {
        min: 0.01,
        max: 999999.99,
      },
      comment: "وزن الطرد بالكيلوغرام",
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "ملاحظات إضافية",
    },

    isCollection: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "تحصيل (دفع عند الاستلام)",
    },

    collectionPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
        customValidator(value) {
          if (this.isCollection && !value) {
            throw new Error(
              "Collection price is required when collection is enabled"
            );
          }
          if (!this.isCollection && value) {
            throw new Error(
              "Collection price should be null when collection is disabled"
            );
          }
        },
      },
      comment: "سعر التحصيل",
    },

    packageImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "مسار صورة الطرد",
    },

    packageImageName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "اسم ملف صورة الطرد",
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
        "returned"
      ),
      defaultValue: "pending",
      allowNull: false,
      comment: "حالة الطلب",
    },

    deliveryFee: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
      comment: "رسوم التوصيل",
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
      comment: "المبلغ الإجمالي",
    },

    estimatedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "تاريخ التسليم المتوقع",
    },

    actualDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "تاريخ التسليم الفعلي",
    },

    driverId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "معرف السائق المكلف",
    },

    // Add userId to track who created the order
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "معرف المستخدم الذي أنشأ الطلب",
    },
  },
  {
    tableName: "delivery_orders",
    timestamps: true,
    paranoid: true, // Enable soft deletes
    indexes: [
      { fields: ["orderNumber"] },
      { fields: ["status"] },
      { fields: ["senderPhone"] },
      { fields: ["receiverPhone"] },
      { fields: ["driverId"] },
      { fields: ["userId"] },
      { fields: ["createdAt"] },
    ],
    hooks: {
      beforeCreate: (order) => {
        // Generate order number if not provided
        if (!order.orderNumber) {
          const timestamp = Date.now().toString(36);
          const random = Math.random().toString(36).substring(2, 7);
          order.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
        }

        // Calculate total amount
        if (order.isCollection && order.collectionPrice && order.deliveryFee) {
          order.totalAmount =
            parseFloat(order.collectionPrice) + parseFloat(order.deliveryFee);
        } else if (order.deliveryFee) {
          order.totalAmount = parseFloat(order.deliveryFee);
        }
      },
      beforeUpdate: (order) => {
        // Recalculate total amount if relevant fields changed
        if (
          order.changed("collectionPrice") ||
          order.changed("deliveryFee") ||
          order.changed("isCollection")
        ) {
          if (
            order.isCollection &&
            order.collectionPrice &&
            order.deliveryFee
          ) {
            order.totalAmount =
              parseFloat(order.collectionPrice) + parseFloat(order.deliveryFee);
          } else if (order.deliveryFee) {
            order.totalAmount = parseFloat(order.deliveryFee);
          }
        }
      },
    },
  }
);

module.exports = DeliveryOrder;

// Utility to check and create table if not exists
async function ensureDeliveryOrderTable() {
  const tableName = DeliveryOrder.getTableName();
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  if (!tables.includes(tableName)) {
    await DeliveryOrder.sync();
    console.log(`Table '${tableName}' created.`);
  } else {
    console.log(`Table '${tableName}' already exists.`);
  }
}

module.exports.ensureDeliveryOrderTable = ensureDeliveryOrderTable;
