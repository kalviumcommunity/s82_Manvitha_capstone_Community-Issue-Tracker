const Approval = require('../models/Approval');
const Community = require('../models/Community');
const User = require('../models/User');
const NotificationController = require('./notifications.controller');
const asyncHandler = require('../utils/asyncHandler');

// --------------------
// Request to join a community (Resident only)
// --------------------
exports.requestJoin = asyncHandler(async (req, res) => {
  const { communityCode, communityId } = req.body;

  if (!communityCode && !communityId) {
    return res.status(400).json({ message: 'Community code or ID is required' });
  }

  let community;
  if (communityId) {
    community = await Community.findById(communityId);
  } else {
    community = await Community.findOne({ code: communityCode });
  }

  if (!community) {
    return res.status(404).json({ message: 'Community not found' });
  }

  // Prevent duplicate pending requests
  const existing = await Approval.findOne({
    communityId: community._id,
    requesterId: req.user.id,
    status: 'PENDING',
  });

  if (existing) {
    return res.status(400).json({ message: 'Join request already pending' });
  }

  const approval = await Approval.create({
    type: 'RESIDENT_JOIN',
    communityId: community._id,
    requesterId: req.user.id,
  });

  // Notify all community presidents
  const presidents = await User.find({ communityId: community._id, role: 'PRESIDENT' });
  presidents.forEach(p => {
    NotificationController.create({
      userId: p._id,
      communityId: community._id,
      type: 'JOIN_REQUEST',
      title: 'New Join Request',
      body: `${req.user.name} has requested to join your community.`,
      link: '/president/manage-community'
    });
  });

  res.status(201).json({ id: approval._id });
});

// --------------------
// List pending join requests (Admin only)
// --------------------
exports.listPending = asyncHandler(async (req, res) => {
  const list = await Approval.find({
    communityId: req.user.communityId,
    status: 'PENDING',
    type: 'RESIDENT_JOIN',
  }).populate('requesterId', 'name email');

  // Filter out any orphaned approvals where the requester user no longer exists
  const activeList = list.filter(app => app.requesterId !== null);

  res.json(activeList);
});

// --------------------
// Approve / Reject join request (Admin only)
// --------------------
exports.decision = asyncHandler(async (req, res) => {
  const { decision, note } = req.body; // APPROVED or REJECTED

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ message: 'Invalid decision' });
  }

  const approval = await Approval.findById(req.params.id);
  if (!approval || String(approval.communityId) !== String(req.user.communityId)) {
    return res.status(404).json({ message: 'Request not found' });
  }

  approval.status = decision;
  approval.note = note;
  approval.decidedAt = new Date();
  approval.approverId = req.user.id;

  await approval.save();

  // If approved, attach resident to community
  if (decision === 'APPROVED') {
    await User.findByIdAndUpdate(approval.requesterId, {
      communityId: approval.communityId,
    });
  }

  // Create notification for the Resident
  await NotificationController.create({
    userId: approval.requesterId,
    communityId: approval.communityId,
    type: 'JOIN_REQUEST',
    title: decision === 'APPROVED' ? 'Join Request Approved' : 'Join Request Declined',
    body: decision === 'APPROVED' 
      ? 'Your request to join the community has been approved!' 
      : `Your request to join the community was declined.${note ? ` Reason: ${note}` : ''}`,
    link: '/resident/dashboard'
  });

  res.json({ status: approval.status });
});

// --------------------
// Cancel join request (Resident only)
// --------------------
exports.cancelRequest = asyncHandler(async (req, res) => {
  const approval = await Approval.findOne({
    _id: req.params.id,
    requesterId: req.user.id,
    status: 'PENDING'
  });

  if (!approval) {
    return res.status(404).json({ message: 'Pending request not found' });
  }

  await approval.deleteOne();
  res.json({ ok: true });
});
