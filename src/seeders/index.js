import "../db/conn.js"; // Import database connection
import PlanModel from "../model/plan.model.js";
import gemMaterials from "./materials/gem_material.js";
import metalMaterial from "./materials/metal_material.js";
import subscription from "./plans/subscription.js";
import topup from "./plans/topup.js";
import background from "./scenes/background.js";
import gemEnv from "./scenes/gem_env.js";
import ground from "./scenes/ground.js";
import metalEnv from "./scenes/metal_env.js";
import scene from "./scenes/scene.js";
import pose from "./pose/pose.js";
import videoAngles from "./videoAngles/videoAngles.js";
import aiShootTemplate from "./aiShootTemplate/aiShootTemplate.js";
import MaterialModel from "../model/material.model.js";
import "../db/conn.js"; // Import database connection
import TopUpModel from "../model/topUp.model.js";
import PoseModel from "../model/pose.model.js";
import VideoAngleModel from "../model/videoAngle.model.js";
import AiShootTemplate from "../model/aiShootTemplate.model.js";

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

    // console.log("🚀 - Seeding Materials");
    // console.log(`📊 - Total materials to insert: ${allMaterials.length}`);

    // const result = await MaterialModel.insertMany(allMaterials);
    // console.log(`✅ - Successfully inserted ${result.length} materials`);

    console.log("🚀 - Seeding Plans");

    // console.log(`📊 - Total Plans to insert: ${subscription.length}`);
    // await PlanModel.insertMany(subscription);
    // console.log(`✅ - Successfully inserted ${subscription.length} Plans`);

    // console.log(`📊 - Total Top ups to insert: ${topup.length}`);
    // await TopUpModel.insertMany(topup);
    // console.log(`✅ - Successfully inserted ${topup.length} Top Ups`);

    // console.log(`📊 - Total Poses to insert: ${pose.length}`);
    // await PoseModel.insertMany(pose);
    // console.log(`✅ - Successfully inserted ${pose.length} Poses`);

    // console.log(`📊 - Total Video Angles to insert: ${videoAngles.length}`);
    // await VideoAngleModel.insertMany(videoAngles);
    // console.log(`✅ - Successfully inserted ${videoAngles.length} Video Angles`);

    // console.log(
    //   `📊 - Total Ai Shoot Templates to insert: ${aiShootTemplate.length}`
    // );
    // await AiShootTemplate.insertMany(aiShootTemplate);
    // console.log(
    //   `✅ - Successfully inserted ${aiShootTemplate.length} Ai Shoot Templates`
    // );

    console.log("🚀 - Seeding Completed");

    // Close database connection
    process.exit(0);
  } catch (error) {
    console.error("❌ - Error during seeding:", error);
    process.exit(1);
  }
}

run();
