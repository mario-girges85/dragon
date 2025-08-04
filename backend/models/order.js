// backend/models/order.js

const { DataTypes } = require("sequelize");
const sequelize = require("../util/db");
const crypto = require("crypto");

// FIXED: Renamed model from DeliveryOrder to Order for consistency
const Order = sequelize.define(
  "Order",
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
      defaultValue: () => {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(3).toString("hex");
        return `ORD-${timestamp}-${random}`.toUpperCase();
      },
    },
    senderName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    senderPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    receiverName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    receiverPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    packageType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isCollection: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    collectionPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    packageImageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    packageImageName: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    },
    userId: {
      // This links the order to the user who created it
      type: DataTypes.UUID,

      allowNull: false, // An order should always have a user
    },
  },
  {
    tableName: "orders", // Conventionally plural
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Order;
