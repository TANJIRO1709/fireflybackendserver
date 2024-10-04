const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      default: 'product'
    }
  });
  
  const Category = mongoose.model('Category', categorySchema);
  
  module.exports = Category;
  
  