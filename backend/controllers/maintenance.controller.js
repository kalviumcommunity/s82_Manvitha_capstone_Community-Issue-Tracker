const MaintenanceInvoice = require('../models/MaintenanceInvoice');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// --------------------
// Generate invoices (ADMIN only)
// --------------------
exports.generate = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { period, amount, dueDate } = req.body;

  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ message: 'Invalid period format (YYYY-MM)' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be positive' });
  }

  // Prevent duplicate invoices
  const exists = await MaintenanceInvoice.exists({
    communityId: req.user.communityId,
    period,
  });

  if (exists) {
    return res.status(400).json({ message: 'Invoices already generated for this period' });
  }

  const residents = await User.find(
    { communityId: req.user.communityId, role: 'RESIDENT' },
    '_id'
  );

  const docs = residents.map(r => ({
    communityId: req.user.communityId,
    residentId: r._id,
    period,
    amount,
    dueDate,
    status: 'PENDING'
  }));

  const created = await MaintenanceInvoice.insertMany(docs);
  res.status(201).json({ created: created.length });
});

// --------------------
// List all invoices (ADMIN only)
// --------------------
exports.list = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const list = await MaintenanceInvoice.find({
    communityId: req.user.communityId
  }).sort({ period: -1 });

  res.json(list);
});

// --------------------
// My invoices
// --------------------
exports.my = asyncHandler(async (req, res) => {
  const list = await MaintenanceInvoice.find({
    communityId: req.user.communityId,
    residentId: req.user.id
  }).sort({ period: -1 });

  res.json(list);
});

// --------------------
// Get one invoice (owner or admin)
// --------------------
exports.one = asyncHandler(async (req, res) => {
  const inv = await MaintenanceInvoice.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!inv) return res.status(404).json({ message: 'Not found' });

  const isOwner = String(inv.residentId) === String(req.user.id);
  const isAdmin = req.user.role === 'PRESIDENT';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(inv);
});

// --------------------
// Mark paid (ADMIN only)
// --------------------
exports.markPaid = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { amount, method, ref } = req.body;

  const inv = await MaintenanceInvoice.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!inv) return res.status(404).json({ message: 'Not found' });

  inv.status = 'PAID';
  inv.payments.push({
    at: new Date(),
    amount,
    method,
    ref
  });

  await inv.save();
  res.json(inv);
});

// --------------------
// Waive invoice (ADMIN only)
// --------------------
exports.waive = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const inv = await MaintenanceInvoice.findOneAndUpdate(
    { _id: req.params.id, communityId: req.user.communityId },
    { status: 'WAIVED' },
    { new: true }
  );

  if (!inv) return res.status(404).json({ message: 'Not found' });

  res.json(inv);
});
