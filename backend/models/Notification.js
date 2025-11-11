const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  type: String,
  title: String,
  body: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
