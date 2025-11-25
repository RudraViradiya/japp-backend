import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

const tokenSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "user" },

    tokens: {
      type: [String],
      default: [],
    },

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

tokenSchema.plugin(mongoosePaginate);

const UserTokenModel = mongoose.model("user-token", tokenSchema);

export default UserTokenModel;
