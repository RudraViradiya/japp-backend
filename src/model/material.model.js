import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;
const schema = new Schema(
  {
    type: { type: String },

    category: { type: String },

    name: { type: String },

    thumbnail: { type: String },

    value: { type: String },

    userId: { type: mongoose.Types.ObjectId },

    weight: { type: Number },

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

const MaterialModel = mongoose.model("material", schema);

export default MaterialModel;
