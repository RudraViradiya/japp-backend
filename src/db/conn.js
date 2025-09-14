import mongoose from "mongoose";

const dbUri = process.env.DB_URI;
console.log("🚀 - dbUri:", dbUri);

mongoose
  .connect(dbUri)
  .then(() => {
    console.log("Database Connection");
  })
  .catch((e) => {
    console.log("Database Not Connected = ", e);
  });
