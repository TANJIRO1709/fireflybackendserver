const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category'
    },
    subcategoryName: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true
    },
  });
  
  const Subcategory = mongoose.model('Subcategory', subcategorySchema);
  
  module.exports = Subcategory;