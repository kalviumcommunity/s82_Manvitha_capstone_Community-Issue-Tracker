const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const c = await Complaint.create({ ...req.body, communityId: req.user.communityId, authorId: req.user.id });
  res.status(201).json(c);
});
exports.list = asyncHandler(async (req, res) => {
  const list = await Complaint.find({ communityId: req.user.communityId }).sort({ createdAt: -1 });
  res.json(list);
});
exports.mine = asyncHandler(async (req, res) => {
  const list = await Complaint.find({ communityId: req.user.communityId, authorId: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
});
exports.one = asyncHandler(async (req, res) => {
  const c = await Complaint.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});
exports.status = asyncHandler(async (req, res) => {
  const c = await Complaint.findOneAndUpdate({ _id: req.params.id, communityId: req.user.communityId }, { status: req.body.status }, { new: true });
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});
exports.remove = asyncHandler(async (req, res) => {
  await Complaint.deleteOne({ _id: req.params.id, communityId: req.user.communityId });
  res.json({ ok: true });
});
