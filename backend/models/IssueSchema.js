const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'in progress', 'resolved'],
    default: 'open'
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
   required: true
  }
});

module.exports=mongoose.model('Issue',issueSchema);