const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mail: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    unique:true,
  }
});

module.exports = mongoose.model('User', userSchema);
