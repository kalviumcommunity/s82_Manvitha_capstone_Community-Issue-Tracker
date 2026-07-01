const Post = require('../models/Post');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');

// --------------------
// Create post
// --------------------
exports.create = asyncHandler(async (req, res) => {
  const { body, photos } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ message: 'Post body is required' });
  }

  const post = await Post.create({
    body,
    photos,
    communityId: req.user.communityId,
    authorId: req.user.id,
    likes: []
  });

  res.status(201).json(post);
});

// --------------------
// List posts
// --------------------
exports.list = asyncHandler(async (req, res) => {
  const list = await Post.find({
    communityId: req.user.communityId
  }).sort({ createdAt: -1 });

  res.json(list);
});

// --------------------
// Get one post
// --------------------
exports.one = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!post) return res.status(404).json({ message: 'Not found' });
  res.json(post);
});

// --------------------
// Update post (author only)
// --------------------
exports.update = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!post) return res.status(404).json({ message: 'Not found' });

  if (String(post.authorId) !== String(req.user.id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { body, photos } = req.body;

  if (body !== undefined) post.body = body;
  if (photos !== undefined) post.photos = photos;

  await post.save();
  res.json(post);
});

// --------------------
// Delete post (author or admin)
// --------------------
exports.remove = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!post) return res.status(404).json({ message: 'Not found' });

  const isOwner = String(post.authorId) === String(req.user.id);
  const isAdmin = req.user.role === 'PRESIDENT';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  await post.deleteOne();
  res.json({ ok: true });
});

// --------------------
// Like / Unlike
// --------------------
exports.like = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!post) return res.status(404).json({ message: 'Not found' });

  const uid = String(req.user.id);
  const idx = post.likes.findIndex(id => String(id) === uid);

  if (idx === -1) {
    post.likes.push(uid);
  } else {
    post.likes.splice(idx, 1);
  }

  await post.save();
  res.json(post);
});

// --------------------
// Comment on post
// --------------------
exports.comment = asyncHandler(async (req, res) => {
  const { body } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ message: 'Comment body is required' });
  }

  const exists = await Post.exists({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!exists) return res.status(404).json({ message: 'Post not found' });

  const comment = await Comment.create({
    parentType: 'POST',
    parentId: req.params.id,
    authorId: req.user.id,
    body
  });

  res.status(201).json(comment);
});
