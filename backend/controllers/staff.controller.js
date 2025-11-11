const Staff = require('../models/Staff');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const s = await Staff.create({ ...req.body, communityId: req.user.communityId });
  res.status(201).json(s);
});
exports.list = asyncHandler(async (req, res) => {
  const list = await Staff.find({ communityId: req.user.communityId });
  res.json(list);
});
exports.one = asyncHandler(async (req, res) => {
  const s = await Staff.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});
exports.update = asyncHandler(async (req, res) => {
  const s = await Staff.findOneAndUpdate({ _id: req.params.id, communityId: req.user.communityId }, req.body, { new: true });
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});
exports.remove = asyncHandler(async (req, res) => {
  await Staff.deleteOne({ _id: req.params.id, communityId: req.user.communityId });
  res.json({ ok: true });
});
