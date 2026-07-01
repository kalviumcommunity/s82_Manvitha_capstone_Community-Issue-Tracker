const mongoose = require('mongoose');
const { Schema } = mongoose;

const IssueHistorySchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'CREATE',
        'UPDATE',
        'ASSIGN',
        'UNASSIGN',
        'STATUS_OPEN',
        'STATUS_IN_PROGRESS',
        'STATUS_RESOLVED',
        'STATUS_CLOSED',
        'COMMENT',
        'RATED',
      ],
      required: true,
    },
    note: { type: String, maxlength: 1000 },
  },
  { _id: false }
);

const IssueSchema = new Schema(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    category: {
      type: String,
      enum: [
        'maintenance',
        'security',
        'noise',
        'cleanliness',
        'amenities',
        'payments',
        'other',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 8000,
    },
    photos: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    history: {
      type: [IssueHistorySchema],
      default: [],
    },
    watchers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// High-value compound indexes
IssueSchema.index({ communityId: 1, status: 1, createdAt: -1 });
IssueSchema.index({ communityId: 1, assigneeId: 1 });
IssueSchema.index({ communityId: 1, priority: 1 });

module.exports =
  mongoose.models.Issue || mongoose.model('Issue', IssueSchema);
