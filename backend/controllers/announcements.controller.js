const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const a = await Announcement.create({
    ...req.body,
    communityId: req.user.communityId,
    authorId: req.user.id
  });
  res.status(201).json(a);
});
exports.list = asyncHandler(async (req, res) => {
  const list = await Announcement.find({ communityId: req.user.communityId })
    .sort({ pinned: -1, createdAt: -1 });
  res.json(list);
});
exports.one = asyncHandler(async (req, res) => {
  const a = await Announcement.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
});
exports.update = asyncHandler(async (req, res) => {
  const a = await Announcement.findOneAndUpdate(
    { _id: req.params.id, communityId: req.user.communityId },
    req.body, { new: true });
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
});
exports.remove = asyncHandler(async (req, res) => {
  await Announcement.deleteOne({ _id: req.params.id, communityId: req.user.communityId });
  res.json({ ok: true });
});
exports.pin = asyncHandler(async (req, res) => {
  const a = await Announcement.findOneAndUpdate(
    { _id: req.params.id, communityId: req.user.communityId },
    { pinned: !!req.body.pinned },
    { new: true }
  );
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
});
