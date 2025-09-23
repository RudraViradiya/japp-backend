import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: { type: String },

    sku: { type: String },

    userId: { ref: "user", required: true, type: mongoose.Types.ObjectId },

    type: { type: String },

    note: { type: String },

    modelUrl: { type: String },

    thumbnail: { type: String },

    modelConfig: { type: Object },

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

const ModelModel = mongoose.model("model", schema);

export default ModelModel;
