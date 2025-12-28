import "../db/conn.js"; // Import database connection
import UserModel from "../model/user.model.js";

// Update these fields in the "models" collection
async function run() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // const result = await UserModel.updateMany(
    //   {},
    //   {
    //     $set: {
    //       activeTopUps: [],
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
