const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');

exports.delete = asyncHandler(async (req, res) => {
  await Comment.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});
