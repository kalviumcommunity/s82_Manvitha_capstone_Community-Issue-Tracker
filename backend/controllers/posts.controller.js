const Post = require('../models/Post');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const p = await Post.create({ ...req.body, communityId: req.user.communityId, authorId: req.user.id });
  res.status(201).json(p);
});
exports.list = asyncHandler(async (req, res) => {
  const list = await Post.find({ communityId: req.user.communityId }).sort({ createdAt: -1 });
  res.json(list);
});
exports.one = asyncHandler(async (req, res) => {
  const p = await Post.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});
exports.update = asyncHandler(async (req, res) => {
  const p = await Post.findOneAndUpdate({ _id: req.params.id, communityId: req.user.communityId }, req.body, { new: true });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});
exports.remove = asyncHandler(async (req, res) => {
  await Post.deleteOne({ _id: req.params.id, communityId: req.user.communityId });
  res.json({ ok: true });
});
exports.like = asyncHandler(async (req, res) => {
  const p = await Post.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!p) return res.status(404).json({ message: 'Not found' });
  const uid = req.user.id;
  const i = p.likes.findIndex(x => String(x) === String(uid));
  if (i === -1) p.likes.push(uid); else p.likes.splice(i, 1);
  await p.save();
  res.json(p);
});
exports.comment = asyncHandler(async (req, res) => {
  const exists = await Post.exists({ _id: req.params.id, communityId: req.user.communityId });
  if (!exists) return res.status(404).json({ message: 'Post not found' });
  const c = await Comment.create({ parentType: 'POST', parentId: req.params.id, authorId: req.user.id, body: req.body.body });
  res.status(201).json(c);
});
