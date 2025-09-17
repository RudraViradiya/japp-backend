import gemMaterials from "./materials/gem_material.js";
import metalMaterial from "./materials/metal_material.js";

import background from "./scenes/background.js";
import ground from "./scenes/ground.js";
import gemEnv from "./scenes/gem_env.js";
import metalEnv from "./scenes/metal_env.js";
import scene from "./scenes/scene.js";
import MaterialModel from "../model/material.model.js";
import "../db/conn.js"; // Import database connection

const allMaterials = [
  ...gemMaterials,
  ...metalMaterial,
  ...background,
  ...ground,
  ...gemEnv,
  ...metalEnv,
  ...scene,
];

async function run() {
  try {
    // Wait a moment for database connection to establish
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Option 1: Clear collections (destructive)
    // await MaterialModel.deleteMany({});

    console.log("🚀 - Seeding Materials");
    console.log(`📊 - Total materials to insert: ${allMaterials.length}`);

    const result = await MaterialModel.insertMany(allMaterials);
    console.log(`✅ - Successfully inserted ${result.length} materials`);
    console.log("🚀 - Seeding Materials Completed");

    // Close database connection
    process.exit(0);
  } catch (error) {
    console.error("❌ - Error during seeding:", error);
    process.exit(1);
  }
}

run();
