const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommunitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
    },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    settings: {
      allowResidentPosts: { type: Boolean, default: true },
      dualApprovalResidents: { type: Boolean, default: false },
      maintenance: {
        monthlyAmount: {
          type: Number,
          min: 0,
          default: 0,
        },
        dueDay: {
          type: Number,
          min: 1,
          max: 31,
          default: 5,
        },
        penaltyPct: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        graceDays: {
          type: Number,
          min: 0,
          max: 30,
          default: 0,
        },
      },
    },
    stats: {
      residents: { type: Number, default: 0, min: 0 },
      issuesOpen: { type: Number, default: 0, min: 0 },
      duesPending: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

// Helpful compound index (optional)
CommunitySchema.index({ name: 1, city: 1 });

module.exports =
  mongoose.models.Community ||
  mongoose.model('Community', CommunitySchema);
