const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApprovalSchema = new Schema({
  type: { type: String, enum: ['SECRETARY_JOIN', 'RESIDENT_JOIN'], required: true },
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approverId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  decidedAt: Date,
  note: String
}, { timestamps: true });

module.exports = mongoose.models.Approval || mongoose.model('Approval', ApprovalSchema);
