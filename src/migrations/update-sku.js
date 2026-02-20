import "../db/conn.js"; // Import database connection
import UserModel from "../model/model.model.js";

// Update these fields in the "models" collection
async function run() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const models = await UserModel.find({ userId: "68e38f6901381094f1fc0aaf" });

    let modifiedCount = 0;

    for (const model of models) {
      const newSku = model.name;

      // Check if any other model already has this SKU
      // We exclude the current model from the check in case it already has this SKU (idempotency)
      const existingModel = await UserModel.findOne({
        sku: newSku,
        _id: { $ne: model._id },
      });

      if (existingModel) {
        console.log(
          `Skipping update for model: "${model.name}" (${model.sku}). SKU "${newSku}" already exists.`,
        );
      } else {
        model.sku = newSku;
        await model.save();
        modifiedCount++;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(
      `Migration complete. Modified: ${modifiedCount}/${models.length}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
