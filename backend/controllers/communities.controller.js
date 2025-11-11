const Community = require('../models/Community');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g,'-');

exports.create = asyncHandler(async (req, res) => {
  // Only PRESIDENT creating their community; they become createdBy
  const { name, city, state } = req.body;
  const code = genCode();
  const slug = slugify(name);
  const c = await Community.create({ name, slug, code, createdBy: req.user.id, location: { city, state } });

  // bind creator to community if not bound
  await User.findByIdAndUpdate(req.user.id, { communityId: c._id });
  res.status(201).json({ id: c._id, code, slug });
});

exports.publicList = asyncHandler(async (req, res) => {
  const list = await Community.find({}, 'name slug code location').sort({ createdAt: -1 });
  res.json(list);
});

exports.details = asyncHandler(async (req, res) => {
  const c = await Community.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

exports.update = asyncHandler(async (req, res) => {
  const c = await Community.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

exports.stats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const c = await Community.findById(id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c.stats || { residents: 0, issuesOpen: 0, duesPending: 0 });
});
