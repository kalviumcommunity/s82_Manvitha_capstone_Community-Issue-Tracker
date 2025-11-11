const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommunitySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  code: { type: String, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  location: { city: String, state: String },
  settings: {
    allowResidentPosts: { type: Boolean, default: true },
    dualApprovalResidents: { type: Boolean, default: false },
    maintenance: {
      monthlyAmount: { type: Number, default: 0 },
      dueDay: { type: Number, default: 5 },
      penaltyPct: { type: Number, default: 0 },
      graceDays: { type: Number, default: 0 }
    }
  },
  stats: { residents: { type: Number, default: 0 }, issuesOpen: { type: Number, default: 0 }, duesPending: { type: Number, default: 0 } }
}, { timestamps: true });

module.exports = mongoose.models.Community || mongoose.model('Community', CommunitySchema);
