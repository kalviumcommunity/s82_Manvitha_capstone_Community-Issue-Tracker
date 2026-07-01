const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
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
      maxlength: 5000,
    },
    photos: {
      type: [String],
      default: [],
    },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: true }
);

// Feed performance
PostSchema.index({ communityId: 1, createdAt: -1 });

// Optional helper
PostSchema.methods.toggleLike = function (userId) {
  const i = this.likes.findIndex(id => String(id) === String(userId));
  if (i === -1) this.likes.push(userId);
  else this.likes.splice(i, 1);
  return this.save();
};

module.exports =
  mongoose.models.Post ||
  mongoose.model('Post', PostSchema);
