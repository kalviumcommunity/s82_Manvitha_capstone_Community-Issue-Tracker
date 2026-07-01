const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'ISSUE_CREATED',
        'ISSUE_ASSIGNED',
        'ISSUE_STATUS_CHANGED',
        'ISSUE_COMMENT',
        'ANNOUNCEMENT',
        'MAINTENANCE_DUE',
        'PAYMENT_RECEIVED',
        'JOIN_REQUEST',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    body: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// High-value indexes
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ communityId: 1, createdAt: -1 });

module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);
