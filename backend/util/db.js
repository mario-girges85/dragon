const mysql = require("mysql2");
const Sequelize = require("sequelize");

// Use environment variables for database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
  }
);

module.exports = sequelize;
