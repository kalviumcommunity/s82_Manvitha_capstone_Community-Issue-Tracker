const Community = require('../models/Community');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const genCode = async () => {
  let code;
  let exists;
  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
    exists = await Community.findOne({ code });
  } while (exists);
  return code;
};

const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, '-');

// --------------------
// Create community (PRESIDENT only)
// --------------------
exports.create = asyncHandler(async (req, res) => {
  const { name, city, state, address, contactPhone, contactEmail } = req.body;

  const code = await genCode();
  const slug = `${slugify(name)}-${code.toLowerCase()}`;

  const community = await Community.create({
    name,
    slug,
    code,
    createdBy: req.user.id,
    location: { city, state, address },
    contactPhone,
    contactEmail,
  });

  await User.findByIdAndUpdate(req.user.id, {
    communityId: community._id,
  });

  res.status(201).json({
    id: community._id,
    code: community.code,
    slug: community.slug,
  });
});

// --------------------
// Public community list (safe fields only)
// --------------------
exports.publicList = asyncHandler(async (req, res) => {
  const list = await Community.find(
    {},
    'name slug code location'
  ).sort({ createdAt: -1 });

  res.json(list);
});

// --------------------
// Community details (safe)
// --------------------
exports.details = asyncHandler(async (req, res) => {
  const community = await Community.findById(
    req.params.id,
    'name slug code location contactPhone contactEmail createdAt'
  );

  if (!community) {
    return res.status(404).json({ message: 'Not found' });
  }

  res.json(community);
});

// --------------------
// Update community (PRESIDENT + same community)
// --------------------
exports.update = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const community = await Community.findById(req.params.id);
  if (!community) {
    return res.status(404).json({ message: 'Not found' });
  }

  if (String(community._id) !== String(req.user.communityId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const allowed = ['name', 'contactPhone', 'contactEmail'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      community[field] = req.body[field];
    }
  });

  if (req.body.address !== undefined) {
    community.location.address = req.body.address;
  }

  await community.save();
  res.json(community);
});

// --------------------
// Community stats (own community only)
// --------------------
exports.stats = asyncHandler(async (req, res) => {
  if (String(req.params.id) !== String(req.user.communityId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const community = await Community.findById(req.user.communityId);
  if (!community) {
    return res.status(404).json({ message: 'Not found' });
  }

  // Dynamic calculation
  const Issue = require('../models/Issue');

  const residentsCount = await User.countDocuments({
    communityId: community._id,
    role: 'RESIDENT'
  });

  const openIssuesCount = await Issue.countDocuments({
    communityId: community._id,
    status: 'OPEN'
  });

  const Approval = require('../models/Approval');
  const pendingRequestsCount = await Approval.countDocuments({
    communityId: community._id,
    status: 'PENDING',
    type: 'RESIDENT_JOIN'
  });

  res.json({
    residents: residentsCount,
    issuesOpen: openIssuesCount,
    pendingRequests: pendingRequestsCount,
  });
});

// --------------------
// List Residents (President only)
// --------------------
exports.listResidents = asyncHandler(async (req, res) => {
  if (String(req.params.id) !== String(req.user.communityId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Fetch all users with role 'RESIDENT' in this community
  const residents = await User.find({
    communityId: req.user.communityId,
    role: 'RESIDENT'
  }, 'name email profile phoneNumber avatarUrl createdAt'); // Safe fields

  res.json(residents);
});

// --------------------
// Transfer Presidency
// --------------------
exports.transferOwnership = asyncHandler(async (req, res) => {
  const { newPresidentId } = req.body;

  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Only the current President can transfer ownership.' });
  }

  // 1. Verify the target user exists and is a RESIDENT of the SAME community
  const targetUser = await User.findOne({
    _id: newPresidentId,
    communityId: req.user.communityId,
    role: 'RESIDENT' // Must be a resident currently
  });

  if (!targetUser) {
    return res.status(404).json({ message: 'Target resident not found or eligible.' });
  }

  // 2. Perform the swap transaction safely
  const session = await User.startSession();
  session.startTransaction();

  try {
    // A. Demote current President (req.user) -> RESIDENT
    const currentUser = await User.findById(req.user.id).session(session);
    currentUser.role = 'RESIDENT';
    await currentUser.save({ session });

    // B. Promote target User -> PRESIDENT
    targetUser.role = 'PRESIDENT';
    await targetUser.save({ session });

    // C. Update Community 'createdBy' reference (optional but good for history)
    await Community.findByIdAndUpdate(
      req.user.communityId,
      { createdBy: targetUser._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Presidency transferred successfully.',
      newPresident: { id: targetUser._id, name: targetUser.name }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// --------------------
// Remove Resident from Community (PRESIDENT only)
// --------------------
exports.removeResident = asyncHandler(async (req, res) => {
  const { id: communityId, residentId } = req.params;

  if (String(communityId) !== String(req.user.communityId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const resident = await User.findOne({
    _id: residentId,
    communityId: communityId,
    role: 'RESIDENT'
  });

  if (!resident) {
    return res.status(404).json({ message: 'Resident not found in this community' });
  }

  resident.communityId = null;
  await resident.save();

  const Approval = require('../models/Approval');
  await Approval.deleteMany({ requesterId: residentId });

  res.json({ message: 'Resident removed from community successfully.' });
});
