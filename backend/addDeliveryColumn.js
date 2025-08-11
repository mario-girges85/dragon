// Script to add deliveryUserId column to orders table
const sequelize = require("./util/db");

async function addDeliveryColumn() {
  try {
    // Add the deliveryUserId column
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN deliveryUserId VARCHAR(36) NULL,
      ADD CONSTRAINT fk_orders_delivery_user 
      FOREIGN KEY (deliveryUserId) REFERENCES users(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    
    console.log("Successfully added deliveryUserId column to orders table");
  } catch (error) {
    console.error("Error adding deliveryUserId column:", error);
  } finally {
    await sequelize.close();
  }
}

addDeliveryColumn();
