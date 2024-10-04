const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  post: {
    type: String,
    default: 'admin'
  },
});



module.exports = mongoose.model('Admin', adminSchema);