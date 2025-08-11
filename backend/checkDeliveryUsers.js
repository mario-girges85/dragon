const User = require("./models/user");
const sequelize = require("./util/db");

async function checkDeliveryUsers() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    const deliveryUsers = await User.findAll({
      where: { role: "delivery" },
      attributes: ["id", "name", "phone", "role"],
    });

    console.log(`Found ${deliveryUsers.length} delivery users:`);
    deliveryUsers.forEach(user => {
      console.log(`- ${user.name} (${user.phone}) - Role: ${user.role}`);
    });

    if (deliveryUsers.length === 0) {
      console.log("\nNo delivery users found! You need to create users with 'delivery' role.");
      console.log("You can either:");
      console.log("1. Create new users with delivery role");
      console.log("2. Change existing users' role to 'delivery' using the admin panel");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

checkDeliveryUsers();
