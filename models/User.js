const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
    email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar:{
    type:String,
    default:'images/default-avatar.jpeg'
  },
  phone: {
    type: String,
    default: '',
  },
  dob: {
    type: Date,
    default: null,
  },
  city: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  street: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isAdmin:{
    type:Boolean,
    default:false,
  }, 
  roles: {
    type: [String],
    default: ['User'],
    enum: ['User', 'Admin', 'Staff'], // Add the 'Admin' role optio
  }

})

module.exports = mongoose.model('User', userSchema);