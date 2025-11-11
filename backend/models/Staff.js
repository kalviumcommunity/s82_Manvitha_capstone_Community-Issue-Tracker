const mongoose = require('mongoose');
const { Schema } = mongoose;

const StaffSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  name: String,
  role: String,
  phone: String,
  email: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
