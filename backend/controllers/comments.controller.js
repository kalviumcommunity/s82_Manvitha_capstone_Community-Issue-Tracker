const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');

exports.delete = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  // Ensure same community
  if (String(comment.communityId) !== String(req.user.communityId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Allow delete if owner or admin
  const isOwner = String(comment.authorId) === String(req.user.id);
  const isAdmin = req.user.role === 'PRESIDENT';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Not allowed to delete this comment' });
  }

  await comment.deleteOne();
  res.json({ ok: true });
});
