import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

const priceSchema = new mongoose.Schema({
  currency: { type: String, required: true },

  symbol: { type: String, required: true },

  amount: { type: Number, required: true },
});

const featureSchema = new mongoose.Schema({
  modelCredit: { type: Number },

  imageCredit: { type: Number },

  videoCredit: { type: Number },

  aiImageCredit: { type: Number },

  storageLimit: { type: Number },
});

const schema = new Schema(
  {
    name: { type: String, required: true },

    planId: { type: String },

    description: { type: String },

    type: {
      type: String,
      enum: [
        "aiImageCredit",
        "videoCredit",
        "imageCredit",
        "modelCredit",
        "storageLimit",
      ],
      required: true,
    },

    features: featureSchema,

    prices: [priceSchema],

    durationInDays: { type: Number },

    weight: { type: Number },

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

const TopUpModel = mongoose.model("topUp", schema);

export default TopUpModel;
