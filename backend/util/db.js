const mysql = require("mysql2");
const Sequelize = require("sequelize");
const sequelize = new Sequelize("dragon", "root", "stopthisshit@ma", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
