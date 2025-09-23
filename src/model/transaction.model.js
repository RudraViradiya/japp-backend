import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

const schema = new Schema(
  {
    name: { type: String, required: true },

    userId: {
      ref: "user",
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },

    planId: { type: String, required: true },

    razorpaySubscriptionId: { type: String, required: true },

    razorpayPaymentId: { type: String },

    razorpaySignature: { type: String },

    amount: { type: Number, required: true },

    currency: { type: String, required: true },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
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

schema.plugin(mongoosePaginate);

const TransactionModel = mongoose.model("transaction", schema);

export default TransactionModel;
