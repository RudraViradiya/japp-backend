import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

const schema = new Schema(
  {
    type: { type: String },
    
    userId: { ref: "user", required: true, type: mongoose.Types.ObjectId },
    
    data: { type: Object },
    
    note: { type: String },

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

const LogModel = mongoose.model("logs", schema);

export default LogModel;
