const mongoose = require('mongoose');
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  status: { type: String, enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'], default: 'OPEN' }
}, { timestamps: true });

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
