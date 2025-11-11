const mongoose = require('mongoose');
const { Schema } = mongoose;

const IssueSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
  category: String,
  title: { type: String, required: true },
  description: String,
  photos: [String],
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  history: [{ at: Date, by: { type: Schema.Types.ObjectId, ref: 'User' }, action: String, note: String }],
  watchers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

module.exports = mongoose.models.Issue || mongoose.model('Issue', IssueSchema);
