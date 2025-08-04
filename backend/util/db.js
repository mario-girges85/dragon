const mysql = require("mysql2");
const Sequelize = require("sequelize");

// Use environment variables for database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || "dragon",
  process.env.DB_USER || "root", 
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
  }
);

module.exports = sequelize;
