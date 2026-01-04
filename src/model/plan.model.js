import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

const priceSchema = new mongoose.Schema({
  currency: { type: String, required: true },

  symbol: { type: String, required: true },

  amount: { type: Number, required: true },

  originalAmount: { type: Number, required: true },
});

const featureSchema = new mongoose.Schema({
  modelCredit: { type: Number, default: 0 },

  material: { type: Number, default: 10 },

  preset: { type: Number, default: 10 },

  customAssets: { type: Number, default: 1 },

  aiImageCredit: { type: Number, default: 1 },

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

  storageLimit: { type: Number, default: null },

  maxVariant: { type: Number, default: 1 },

  embed: { type: Boolean, default: false },

  aiImageCredit: { type: Number, default: 0 },
});

const schema = new Schema(
  {
    name: { type: String, required: true },

    planId: { type: String },

    weight: { type: Number },

    description: { type: String },

    durationInDays: { type: Number },

    type: {
      type: String,
      enum: ["LIMITED", "UNLIMITED"],
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
