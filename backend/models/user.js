const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const User = sequelize.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true, // Made optional as per your form
      unique: true,
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
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
    orders: {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Array of user orders",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    tableName: "users",
  }
);

module.exports = User;

// Utility to check and create table if not exists
async function ensureUserTable() {
  const tableName = User.getTableName();
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  if (!tables.includes(tableName)) {
    await User.sync();
    console.log(`Table '${tableName}' created.`);
  } else {
    console.log(`Table '${tableName}' already exists.`);
  }
}

module.exports.ensureUserTable = ensureUserTable;
