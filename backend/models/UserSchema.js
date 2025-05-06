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
    required: [true, "Password is required"]
  },
  role: {
    type: String,
    enum: ['president', 'vice-president', 'resident'],
    default: 'resident',
    required: true
  },
  issues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
