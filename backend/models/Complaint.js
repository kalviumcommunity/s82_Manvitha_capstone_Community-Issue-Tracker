const mongoose = require('mongoose');
const { Schema } = mongoose;

const ComplaintSchema = new Schema(
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
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
  },
  { timestamps: true }
);

// Helpful compound indexes
ComplaintSchema.index({ communityId: 1, createdAt: -1 });
ComplaintSchema.index({ communityId: 1, authorId: 1 });

module.exports =
  mongoose.models.Complaint ||
  mongoose.model('Complaint', ComplaintSchema);
