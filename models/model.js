const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelSchema = new Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "DesignCategory",
  },
  modelUrl: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modelName: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("Model", modelSchema);
