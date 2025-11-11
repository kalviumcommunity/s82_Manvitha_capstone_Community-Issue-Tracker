const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const list = await Notification.find({ userId: req.user.id, communityId: req.user.communityId }).sort({ createdAt: -1 });
  res.json(list);
});
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, communityId: req.user.communityId, read: false }, { read: true });
  res.json({ ok: true });
});
exports.markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true });
  res.json({ ok: true });
});
exports.remove = asyncHandler(async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ ok: true });
});
