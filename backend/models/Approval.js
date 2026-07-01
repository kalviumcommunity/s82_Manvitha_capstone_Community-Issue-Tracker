const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApprovalSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['SECRETARY_JOIN', 'RESIDENT_JOIN'],
      required: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    approverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    decidedAt: Date,
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending approvals
ApprovalSchema.index(
  { communityId: 1, requesterId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'PENDING' } }
);

module.exports =
  mongoose.models.Approval ||
  mongoose.model('Approval', ApprovalSchema);
