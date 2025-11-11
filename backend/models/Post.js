const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
  communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: String,
  photos: [String],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);
