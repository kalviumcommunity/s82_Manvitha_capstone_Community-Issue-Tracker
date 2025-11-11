const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const i = await Issue.create({
    ...req.body,
    communityId: req.user.communityId,
    createdBy: req.user.id,
    history: [{ at: new Date(), by: req.user.id, action: 'CREATE' }]
  });
  res.status(201).json(i);
});
exports.list = asyncHandler(async (req, res) => {
  const q = { communityId: req.user.communityId };
  if (req.query.status) q.status = req.query.status;
  const list = await Issue.find(q).sort({ createdAt: -1 });
  res.json(list);
});
exports.my = asyncHandler(async (req, res) => {
  const list = await Issue.find({ communityId: req.user.communityId, createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
});
exports.one = asyncHandler(async (req, res) => {
  const i = await Issue.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!i) return res.status(404).json({ message: 'Not found' });
  res.json(i);
});
exports.update = asyncHandler(async (req, res) => {
  const i = await Issue.findOneAndUpdate(
    { _id: req.params.id, communityId: req.user.communityId },
    req.body, { new: true }
  );
  if (!i) return res.status(404).json({ message: 'Not found' });
  res.json(i);
});
exports.remove = asyncHandler(async (req, res) => {
  await Issue.deleteOne({ _id: req.params.id, communityId: req.user.communityId });
  res.json({ ok: true });
});
exports.status = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const i = await Issue.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!i) return res.status(404).json({ message: 'Not found' });
  i.status = status;
  i.history.push({ at: new Date(), by: req.user.id, action: `STATUS_${status}`, note });
  await i.save();
  res.json(i);
});
exports.assign = asyncHandler(async (req, res) => {
  const { assigneeId, note } = req.body;
  const i = await Issue.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!i) return res.status(404).json({ message: 'Not found' });
  i.assigneeId = assigneeId;
  i.history.push({ at: new Date(), by: req.user.id, action: 'ASSIGN', note });
  await i.save();
  res.json(i);
});
exports.comment = asyncHandler(async (req, res) => {
  const exists = await Issue.exists({ _id: req.params.id, communityId: req.user.communityId });
  if (!exists) return res.status(404).json({ message: 'Issue not found' });
  const c = await Comment.create({
    parentType: 'ISSUE',
    parentId: req.params.id,
    authorId: req.user.id,
    body: req.body.body
  });
  res.status(201).json(c);
});
exports.comments = asyncHandler(async (req, res) => {
  const list = await Comment.find({ parentType: 'ISSUE', parentId: req.params.id }).sort({ createdAt: 1 });
  res.json(list);
});
exports.rating = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  const i = await Issue.findOneAndUpdate(
    { _id: req.params.id, communityId: req.user.communityId },
    { rating }, { new: true });
  if (!i) return res.status(404).json({ message: 'Not found' });
  res.json(i);
});
