import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcrypt";
import { paginatorCustomLabels } from "../db/config.js";
import { config } from "dotenv";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };
const { Schema } = mongoose;
const schema = new Schema(
  {
    name: { type: String },

    email: {
      type: String,
      unique: true,
      validate: {
        validator() {
          return /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(
            this.email?.toString().toLowerCase().trim()
          );
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    password: { type: String },

    phoneNo: { type: Number },

    county: { type: String },

    state: { type: String },

    city: { type: String },

    activePlans: [{ type: Object }],

    config: { type: Object },

    modelCredit: { type: Number },

    isVerified: { type: Boolean },

    isBlocked: { type: Boolean },

    otp: { type: Number },

    otpExpires: { type: Number },

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

schema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

schema.pre("save", async function (next) {
  this.isBlocked = true;
  this.email = this.email.toString().trim().toLowerCase();
  next();
});

schema.pre("insertMany", async (next, docs) => {
  if (docs && docs.length) {
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      if (element.password) {
        element.password = await bcrypt.hash(element.password, 8);
      }
      element.email = element.email.toString().trim().toLowerCase();
    }
  }
  next();
});

schema.method("toJSON", function () {
  const { _id, __v, password, ...object } = this.toObject({ virtuals: true });
  return object;
});

schema.plugin(mongoosePaginate);

const UserModel = mongoose.model("user", schema);

export default UserModel;
