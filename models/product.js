const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Subcategory",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  modelUrl: {
    type: String,
    trim: true,
    required: false,
  },
  textureUrl: {
    type: String,
    trim: true,
    required: false,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  additionalFields: {
    type: Object,
    required: false,
    default: {},
  },
  constraints: {
    canFly: {
      type: Boolean,
      default: true,
    },
    canMove: {
      type: Boolean,
      default: true,
    },
    canRotate: {
      type: Boolean,
      default: true,
    },
    stickWalls: {
      type: Boolean,
      default: false,
    },
    stickCeiling: {
      type: Boolean,
      default: false,
    },
  },
});

module.exports = mongoose.model("Product", productSchema);
