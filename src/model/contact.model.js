import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };
const { Schema } = mongoose;

const schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator() {
          return /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(
            this.email?.toString().toLowerCase().trim()
          );
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
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

schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  return object;
});

schema.plugin(mongoosePaginate);

const ContactModel = mongoose.model("contact", schema);

export default ContactModel;
