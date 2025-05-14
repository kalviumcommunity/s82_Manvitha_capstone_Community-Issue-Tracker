const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/
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
master
});

module.exports = mongoose.model('User', userSchema);
