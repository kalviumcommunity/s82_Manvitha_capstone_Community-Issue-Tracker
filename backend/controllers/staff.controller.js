const Staff = require('../models/Staff');
const asyncHandler = require('../utils/asyncHandler');

// --------------------
// Create staff (ADMIN only)
// --------------------
exports.create = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { name, role, phone, email, active } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: 'Name and role are required' });
  }

  const staff = await Staff.create({
    name,
    role,
    phone,
    email,
    active: active !== undefined ? active : true,
    communityId: req.user.communityId
  });

  res.status(201).json(staff);
});

// --------------------
// List staff (ADMIN only)
// --------------------
exports.list = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const list = await Staff.find({
    communityId: req.user.communityId
  });

  res.json(list);
});

// --------------------
// Get one staff (ADMIN only)
// --------------------
exports.one = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const staff = await Staff.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!staff) return res.status(404).json({ message: 'Not found' });
  res.json(staff);
});

// --------------------
// Update staff (ADMIN only)
// --------------------
exports.update = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const staff = await Staff.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!staff) return res.status(404).json({ message: 'Not found' });

  const { name, role, phone, email, active } = req.body;

  if (name !== undefined) staff.name = name;
  if (role !== undefined) staff.role = role;
  if (phone !== undefined) staff.phone = phone;
  if (email !== undefined) staff.email = email;
  if (active !== undefined) staff.active = active;

  await staff.save();
  res.json(staff);
});

// --------------------
// Delete staff (ADMIN only)
// --------------------
exports.remove = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const staff = await Staff.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!staff) return res.status(404).json({ message: 'Not found' });

  await staff.deleteOne();
  res.json({ ok: true });
});
