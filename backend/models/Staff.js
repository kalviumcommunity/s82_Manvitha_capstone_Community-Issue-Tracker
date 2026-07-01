const mongoose = require('mongoose');
const { Schema } = mongoose;

const StaffSchema = new Schema(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      required: true,
      enum: [
        'SECURITY',
        'CLEANING',
        'MAINTENANCE',
        'ELECTRICIAN',
        'PLUMBER',
        'GARDENER',
        'OTHER',
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Fast staff listing per community
StaffSchema.index({ communityId: 1, active: 1 });

module.exports =
  mongoose.models.Staff ||
  mongoose.model('Staff', StaffSchema);
