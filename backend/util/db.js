const mysql = require("mysql2");
const Sequelize = require("sequelize");
const sequelize = new Sequelize("dragon", "root", "stopthisshit@ma", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;

// const mysql = require("mysql2");
// const Sequelize = require("sequelize");

// const sequelize = new Sequelize(
//   "defaultdb",
//   "avnadmin",
//   "AVNS_TGdmfc9bL_ZqfA24MUP",
//   {
//     host: "mysql-mario-dragon801.g.aivencloud.com",
//     port: 10883,
//     dialect: "mysql",
//   }
// );

// module.exports = sequelize;
