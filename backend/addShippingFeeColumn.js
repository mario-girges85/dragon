const sequelize = require("./util/db");

async function addShippingFeeColumn() {
  try {
    // Add shippingFee column to orders table
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN shippingFee DECIMAL(10,2) NULL 
      COMMENT 'Shipping fee set by admin when assigning to delivery'
    `);

    console.log("✅ Successfully added shippingFee column to orders table");

    // Close the database connection
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error adding shippingFee column:", error);

    // Check if column already exists
    if (error.message.includes("Duplicate column name")) {
      console.log("ℹ️  shippingFee column already exists");
    }

    await sequelize.close();
    process.exit(1);
  }
}

// Run the migration
addShippingFeeColumn();
