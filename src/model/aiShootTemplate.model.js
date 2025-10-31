import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;
const schema = new Schema(
  {
    name: { type: String },

    value: { type: String },

    thumbnail: { type: String },

    weight: { type: Number },

    isActive: { type: Boolean },

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

const AiShootTemplateModel = mongoose.model("ai-shoot-template-model", schema);

export default AiShootTemplateModel;
