import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;
const schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    planId: { type: String, required: true },

    razorpaySubscriptionId: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ["created", "active", "pending", "halted", "cancelled", "captured"],
      default: "created",
    },

    startDate: { type: Date, default: Date.now },

    endDate: { type: Date },

    nextBillingDate: { type: Date },

    cycleCount: { type: Number, default: 0 },

    notes: { type: Object, default: {} },

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

const SubscriptionModel = mongoose.model("subscription", schema);

export default SubscriptionModel;
