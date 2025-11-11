const Approval = require('../models/Approval');
const Community = require('../models/Community');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.requestJoin = asyncHandler(async (req, res) => {
  const { communityCode, asRole } = req.body; // RESIDENT or SECRETARY
  const community = await Community.findOne({ code: communityCode });
  if (!community) return res.status(404).json({ message: 'Community not found' });

  const type = asRole === 'SECRETARY' ? 'SECRETARY_JOIN' : 'RESIDENT_JOIN';
  const ap = await Approval.create({
    type, communityId: community._id, requesterId: req.user.id
  });
  res.status(201).json({ id: ap._id });
});

exports.listPending = asyncHandler(async (req, res) => {
  const list = await Approval.find({ communityId: req.user.communityId, status: 'PENDING' })
    .populate('requesterId', 'name email');
  res.json(list);
});

exports.decision = asyncHandler(async (req, res) => {
  const { decision, note } = req.body; // APPROVED or REJECTED
  const ap = await Approval.findById(req.params.id);
  if (!ap || String(ap.communityId) !== String(req.user.communityId))
    return res.status(404).json({ message: 'Not found' });

  ap.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  ap.note = note;
  ap.decidedAt = new Date();
  ap.approverId = req.user.id;
  await ap.save();

  if (ap.status === 'APPROVED') {
    await User.findByIdAndUpdate(ap.requesterId, { communityId: ap.communityId });
  }
  res.json({ status: ap.status });
});
