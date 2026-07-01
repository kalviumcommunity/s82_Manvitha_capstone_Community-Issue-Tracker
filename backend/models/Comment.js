const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    parentType: {
      type: String,
      enum: ['ISSUE', 'POST'],
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 3000,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for fast comment threads
CommentSchema.index({ parentType: 1, parentId: 1, createdAt: 1 });

// Optional helper
CommentSchema.methods.isDeleted = function () {
  return !!this.deletedAt;
};

module.exports =
  mongoose.models.Comment ||
  mongoose.model('Comment', CommentSchema);
