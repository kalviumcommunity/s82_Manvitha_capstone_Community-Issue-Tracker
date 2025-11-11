const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnnouncementSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  body: String,
  attachments: [String],
  pinned: { type: Boolean, default: false },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
