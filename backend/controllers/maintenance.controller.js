const MaintenanceInvoice = require('../models/MaintenanceInvoice');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.generate = asyncHandler(async (req, res) => {
  const { period, amount, dueDate } = req.body; // "YYYY-MM"
  const residents = await User.find({ communityId: req.user.communityId, role: 'RESIDENT' }, '_id');
  const docs = residents.map(r => ({
    communityId: req.user.communityId,
    residentId: r._id,
    period, amount, dueDate
  }));
  const created = await MaintenanceInvoice.insertMany(docs);
  res.status(201).json({ created: created.length });
});

exports.list = asyncHandler(async (req, res) => {
  const list = await MaintenanceInvoice.find({ communityId: req.user.communityId }).sort({ period: -1 });
  res.json(list);
});
exports.my = asyncHandler(async (req, res) => {
  const list = await MaintenanceInvoice.find({ communityId: req.user.communityId, residentId: req.user.id }).sort({ period: -1 });
  res.json(list);
});
exports.one = asyncHandler(async (req, res) => {
  const inv = await MaintenanceInvoice.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json(inv);
});
exports.markPaid = asyncHandler(async (req, res) => {
  const { amount, method, ref } = req.body;
  const inv = await MaintenanceInvoice.findOne({ _id: req.params.id, communityId: req.user.communityId });
  if (!inv) return res.status(404).json({ message: 'Not found' });
  inv.status = 'PAID';
  inv.payments.push({ at: new Date(), amount, method, ref });
  await inv.save();
  res.json(inv);
});
exports.waive = asyncHandler(async (req, res) => {
  const inv = await MaintenanceInvoice.findOneAndUpdate(
    { _id: req.params.id, communityId: req.user.communityId },
    { status: 'WAIVED' }, { new: true });
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json(inv);
});
