import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { paginatorCustomLabels } from "../db/config.js";

mongoosePaginate.paginate.options = { customLabels: paginatorCustomLabels };

const { Schema } = mongoose;

// Template Element Schema
const TemplateElementSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "text", "customField", "shape"],
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    // Text properties
    text: { type: String },
    fontSize: { type: Number },
    fontFamily: { type: String },
    color: { type: String },
    align: { type: String, enum: ["left", "center", "right"] },
    fontWeight: { type: String, enum: ["normal", "bold"] },
    fontStyle: { type: String, enum: ["normal", "italic"] },
    // Custom field type
    customFieldType: {
      type: String,
      enum: ["sku", "price", "metalType", "description"],
    },
    // Shape properties
    shapeType: {
      type: String,
      enum: ["rect", "circle", "line", "ellipse", "triangle", "arrow"],
    },
    fill: { type: String },
    stroke: { type: String },
    strokeWidth: { type: Number },
    cornerRadius: { type: Number },
    points: { type: [Number] },
    strokeDashArray: { type: [Number] },
    // Z-index and rotation
    zIndex: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },
  },
  { _id: false }
);

// Template Page Layout Schema
const TemplatePageLayoutSchema = new Schema(
  {
    backgroundColor: { type: String, default: "#ffffff" },
    backgroundGradient: {
      from: { type: String },
      to: { type: String },
      direction: { type: String, enum: ["vertical", "horizontal"] },
    },
    elements: { type: [TemplateElementSchema], default: [] },
  },
  { _id: false }
);

// Main Catalog Template Schema
const schema = new Schema(
  {
    templateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    fontFamily: { type: String, default: "Inter" },
    pages: { type: [TemplatePageLayoutSchema], required: true },
    // User association
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      default: null, // null = base template, ObjectId = user template
      index: true,
    },
    // Template type
    isBaseTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Preview image URL
    previewImage: { type: String },
    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Index for user queries
schema.index({ userId: 1, isBaseTemplate: 1 });
// Note: templateId already has unique index via unique: true, no need for explicit index

schema.plugin(mongoosePaginate);

const CatalogTemplateModel = mongoose.model("catalog-template", schema);

export default CatalogTemplateModel;

