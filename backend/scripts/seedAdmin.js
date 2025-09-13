// backend/scripts/seedAdmin.js
require("dotenv").config();

const bcrypt = require("bcrypt");
const sequelize = require("../util/db");
const User = require("../models/user");

async function seedAdmin() {
  const adminData = {
    name: "mario",
    phone: "01285948011",
    password: "000000",
    role: "admin",
    address: "N/A",
    email: null,
  };

  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existing = await User.findOne({ where: { phone: adminData.phone } });
    const hashed = await bcrypt.hash(adminData.password, 10);

    if (!existing) {
      await User.create({
        name: adminData.name,
        phone: adminData.phone,
        password: hashed,
        role: adminData.role,
        address: adminData.address,
        email: adminData.email,
      });
      console.log("✅ Admin user created.");
    } else {
      existing.name = adminData.name;
      existing.role = adminData.role;
      existing.address = adminData.address;
      existing.password = hashed;
      await existing.save();
      console.log("ℹ️  Admin user already existed. Details updated.");
    }
  } catch (err) {
    console.error("❌ Failed to seed admin:", err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
