import gemMaterials from "./materials/gem_material.js";
import metalMaterial from "./materials/metal_material.js";

import background from "./scenes/background.js";
import ground from "./scenes/ground.js";
import gemEnv from "./scenes/gem_env.js";
import metalEnv from "./scenes/metal_env.js";
import scene from "./scenes/scene.js";
import MaterialModel from "../model/material.model.js";

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
  // Option 1: Clear collections (destructive)
  await MaterialModel.deleteMany({});

  console.log("🚀 - Seeding Materials");
  await User.insertMany(allMaterials);
  console.log("🚀 - Seeding Materials Completed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
