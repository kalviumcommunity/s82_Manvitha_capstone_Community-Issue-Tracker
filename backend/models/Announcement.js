const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnnouncementSchema = new Schema(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    body: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    attachments: {
      type: [String],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index for feed queries
AnnouncementSchema.index({ communityId: 1, pinned: -1, createdAt: -1 });

// Optional helper (nice touch)
AnnouncementSchema.methods.isExpired = function () {
  return this.expiresAt && this.expiresAt < new Date();
};

module.exports =
  mongoose.models.Announcement ||
  mongoose.model('Announcement', AnnouncementSchema);
