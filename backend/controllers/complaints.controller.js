const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_STATUS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

// --------------------
// Create complaint
// --------------------
exports.create = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority,
    communityId: req.user.communityId,
    authorId: req.user.id,
    status: 'OPEN',
  });

  res.status(201).json(complaint);
});

// --------------------
// List all complaints (Admin only)
// --------------------
exports.list = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const list = await Complaint.find({
    communityId: req.user.communityId,
  }).sort({ createdAt: -1 });

  res.json(list);
});

// --------------------
// List my complaints
// --------------------
exports.mine = asyncHandler(async (req, res) => {
  const list = await Complaint.find({
    communityId: req.user.communityId,
    authorId: req.user.id,
  }).sort({ createdAt: -1 });

  res.json(list);
});

// --------------------
// Get one complaint
// --------------------
exports.one = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({
    _id: req.params.id,
    communityId: req.user.communityId,
  });

  if (!complaint) {
    return res.status(404).json({ message: 'Not found' });
  }

  res.json(complaint);
});

// --------------------
// Update status (Admin only)
// --------------------
exports.status = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { status } = req.body;
  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const complaint = await Complaint.findOneAndUpdate(
    { _id: req.params.id, communityId: req.user.communityId },
    { status },
    { new: true }
  );

  if (!complaint) {
    return res.status(404).json({ message: 'Not found' });
  }

  res.json(complaint);
});

// --------------------
// Delete complaint (Author or Admin)
// --------------------
exports.remove = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({
    _id: req.params.id,
    communityId: req.user.communityId,
  });

  if (!complaint) {
    return res.status(404).json({ message: 'Not found' });
  }

  const isOwner = String(complaint.authorId) === String(req.user.id);
  const isAdmin = req.user.role === 'PRESIDENT';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  await complaint.deleteOne();
  res.json({ ok: true });
});
