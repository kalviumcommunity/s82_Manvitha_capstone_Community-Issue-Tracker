const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
  parentType: { type: String, enum: ['ISSUE', 'POST'], required: true },
  parentId: { type: Schema.Types.ObjectId, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
