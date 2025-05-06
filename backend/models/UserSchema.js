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
    required: true
  },
  role: {
    type: String,
    enum: ['resident', 'president'],
    default: 'resident',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  issuesRaised: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }]
});

module.exports = mongoose.model('User', userSchema);
