// backend/models/user.js

const Sequelize = require("sequelize");
const sequelize = require("../util/db");

// FIXED: Changed model name from "user" to "User" for consistency
const User = sequelize.define(
  "User",
  {
    id: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    // ... all other fields remain the same
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    profile_image: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Path to user profile image",
    },
    role: {
      type: Sequelize.ENUM("user", "delivery", "admin"),
      allowNull: false,
      defaultValue: "user",
      comment: "User role",
    },
    // REMOVED: The 'orders' column is not needed here as it's handled by associations
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

// This function is not needed if you sync in index.js
// module.exports.ensureUserTable = ensureUserTable;

module.exports = User;
