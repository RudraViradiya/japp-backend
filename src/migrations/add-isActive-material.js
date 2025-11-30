import "../db/conn.js"; // Import database connection
import MaterialModel from "../model/material.model.js";

// Update these fields in the "models" collection
async function run() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // const result = await MaterialModel.updateMany(
    //   {},
    //   {
    //     $set: {
    //       isActive: true,
    //     },
    //   }
    // );

    // console.log(`Migration complete. Modified: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
