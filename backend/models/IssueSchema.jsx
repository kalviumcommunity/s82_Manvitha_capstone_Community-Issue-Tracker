const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ['open', 'in progress', 'resolved'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Issue', issueSchema);
