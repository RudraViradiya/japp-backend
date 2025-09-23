import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

const priceSchema = new mongoose.Schema({
  currency: { type: String, required: true },

  amount: { type: Number, required: true },
});

const featureSchema = new mongoose.Schema({
  modelCredit: { type: Number, default: 0 },

  material: { type: Number, default: 0 },

  preset: { type: Number, default: 0 },

  customAssets: { type: Number, default: 0 }, // updated from boolean
  displayQuality: {
    type: String,
    enum: ["low", "medium", "high", "ultra high"],
    default: "medium",
  },
  imageResolution: {
    type: String,
    enum: ["hd", "full hd", "2k", "4k", "8k"],
    default: "hd",
  },
  videoResolution: {
    type: String,
    enum: ["hd", "full hd", "2k", "4k", "8k"],
    default: "hd",
  },

  singleImageGeneration: { type: Number, default: 0 },

  multiImageGeneration: { type: Number, default: 0 },

  customVideoAngle: { type: Boolean, default: false }, // video shoot

  embed: { type: Boolean, default: false },

  aiImageGeneration: { type: Boolean, default: false },

  aiImageCredit: { type: Number, default: 0 },

  multiImageFromCAD: { type: Number, default: 0 },

  pdfCatalogue: { type: Boolean, default: false },

  playground: { type: Boolean, default: false },
});

const schema = new Schema(
  {
    name: { type: String, required: true },

    planId: { type: String },

    description: { type: String },

    durationInDays: { type: Number },

    type: {
      type: String,
      enum: ["subscription", "credits", "custom"],
      required: true,
    },

    description: [{ type: String }],

    features: featureSchema,

    prices: [priceSchema],

    isActive: { type: Boolean, default: true },

    createdAt: { type: Date },

    updatedAt: { type: Date },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

schema.plugin(mongoosePaginate);

const PlanModel = mongoose.model("plan", schema);

export default PlanModel;
