const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const User = require('../models/User');
const NotificationController = require('./notifications.controller');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_STATUS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const ALLOWED_PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// --------------------
// Create Issue
// --------------------
exports.create = asyncHandler(async (req, res) => {
  const { title, description, category, priority, photos } = req.body;

  const issue = await Issue.create({
    title,
    description,
    category,
    priority: ALLOWED_PRIORITY.includes(priority) ? priority : 'LOW',
    photos,
    communityId: req.user.communityId,
    createdBy: req.user.id,
    history: [{ at: new Date(), by: req.user.id, action: 'CREATE' }]
  });

  // Notify President(s) of the community
  const presidents = await User.find({
    communityId: req.user.communityId,
    role: 'PRESIDENT'
  });

  presidents.forEach(p => {
    NotificationController.create({
      userId: p._id,
      communityId: req.user.communityId,
      type: 'ISSUE_CREATED',
      title: 'New Issue Reported',
      body: `${req.user.name} reported: ${title}`,
      link: `/president/tickets`
    });
  });

  res.status(201).json(issue);
});

// --------------------
// List Issues (community)
// --------------------
exports.list = asyncHandler(async (req, res) => {
  const q = { communityId: req.user.communityId };
  if (req.query.status && ALLOWED_STATUS.includes(req.query.status)) {
    q.status = req.query.status;
  }

  const list = await Issue.find(q).sort({ createdAt: -1 });
  res.json(list);
});

// --------------------
// My Issues
// --------------------
exports.my = asyncHandler(async (req, res) => {
  const list = await Issue.find({
    communityId: req.user.communityId,
    createdBy: req.user.id
  }).sort({ createdAt: -1 });

  res.json(list);
});

// --------------------
// Get One
// --------------------
exports.one = asyncHandler(async (req, res) => {
  const issue = await Issue.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!issue) return res.status(404).json({ message: 'Not found' });
  res.json(issue);
});

// --------------------
// Update Issue (creator only)
// --------------------
exports.update = asyncHandler(async (req, res) => {
  const issue = await Issue.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!issue) return res.status(404).json({ message: 'Not found' });

  // Residents cannot edit resolved or closed tickets
  if (req.user.role.toUpperCase() === 'RESIDENT' && ['RESOLVED', 'CLOSED'].includes(issue.status.toUpperCase())) {
    return res.status(400).json({ message: 'Cannot edit a resolved or closed ticket' });
  }

  const isOwner = String(issue.createdBy) === String(req.user.id);
  const isAdmin = req.user.role && req.user.role.toUpperCase() === 'PRESIDENT';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { title, description, category, priority, photos } = req.body;

  Object.assign(issue, {
    title,
    description,
    category,
    priority,
    photos
  });

  issue.history.push({ at: new Date(), by: req.user.id, action: 'UPDATE' });
  await issue.save();

  res.json(issue);
});

// --------------------
// Delete Issue (creator or admin)
// --------------------
exports.remove = asyncHandler(async (req, res) => {
  const issue = await Issue.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!issue) return res.status(404).json({ message: 'Not found' });

  const isOwner = String(issue.createdBy) === String(req.user.id);
  const isAdmin = req.user.role === 'PRESIDENT';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  await issue.deleteOne();
  res.json({ ok: true });
});

// --------------------
// Change Status (ADMIN only)
// --------------------
exports.status = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { status, note } = req.body;
  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const issue = await Issue.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!issue) return res.status(404).json({ message: 'Not found' });

  issue.status = status;
  issue.history.push({
    at: new Date(),
    by: req.user.id,
    action: `STATUS_${status}`,
    note
  });

  await issue.save();

  // Notify the resident who created the issue
  if (String(issue.createdBy) !== String(req.user.id)) {
    NotificationController.create({
      userId: issue.createdBy,
      communityId: issue.communityId,
      type: 'ISSUE_STATUS_CHANGED',
      title: 'Issue Status Updated',
      body: `Your issue "${issue.title}" is now ${status}`,
      link: `/resident/my-tickets`
    });
  }

  res.json(issue);
});

// --------------------
// Assign Issue (ADMIN only)
// --------------------
exports.assign = asyncHandler(async (req, res) => {
  if (req.user.role !== 'PRESIDENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { assigneeId, note } = req.body;

  const issue = await Issue.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!issue) return res.status(404).json({ message: 'Not found' });

  issue.assigneeId = assigneeId;
  issue.history.push({
    at: new Date(),
    by: req.user.id,
    action: 'ASSIGN',
    note
  });

  await issue.save();
  res.json(issue);
});

// --------------------
// Comment
// --------------------
exports.comment = asyncHandler(async (req, res) => {
  const exists = await Issue.exists({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!exists) return res.status(404).json({ message: 'Issue not found' });

  const comment = await Comment.create({
    parentType: 'ISSUE',
    parentId: req.params.id,
    authorId: req.user.id,
    body: req.body.body
  });

  // Populate immediate
  await comment.populate('authorId', 'name role avatar');

  // Notify logic
  const validIssue = await Issue.findById(req.params.id);
  if (validIssue) {
    let targetUserId = null;
    let notifTitle = '';

    // If Admin commented -> Notify Resident
    if (req.user.role === 'PRESIDENT' && String(validIssue.createdBy) !== String(req.user.id)) {
      targetUserId = validIssue.createdBy;
      notifTitle = 'New Comment on your Issue';
    }
    // If Resident commented -> Notify President(s)
    else if (req.user.role === 'RESIDENT') {
      // Find presidents
      const presidents = await User.find({ communityId: validIssue.communityId, role: 'PRESIDENT' });
      presidents.forEach(p => {
        NotificationController.create({
          userId: p._id,
          communityId: validIssue.communityId,
          type: 'ISSUE_COMMENT',
          title: 'New Comment on Issue',
          body: `${req.user.name} commented on "${validIssue.title}"`,
          link: `/president/tickets`
        });
      });
    }

    if (targetUserId) {
      NotificationController.create({
        userId: targetUserId,
        communityId: validIssue.communityId,
        type: 'ISSUE_COMMENT',
        title: notifTitle,
        body: `${req.user.name}: ${req.body.body.substring(0, 50)}...`,
        link: `/resident/my-tickets`
      });
    }
  }

  res.status(201).json(comment);
});

// --------------------
// Get Comments
// --------------------
exports.comments = asyncHandler(async (req, res) => {
  const list = await Comment.find({
    parentType: 'ISSUE',
    parentId: req.params.id
  })
    .populate('authorId', 'name role avatar')
    .sort({ createdAt: 1 });

  res.json(list);
});

// --------------------
// Rating (creator only, after resolved)
// --------------------
exports.rating = asyncHandler(async (req, res) => {
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating' });
  }

  const issue = await Issue.findOne({
    _id: req.params.id,
    communityId: req.user.communityId
  });

  if (!issue) return res.status(404).json({ message: 'Not found' });

  if (String(issue.createdBy) !== String(req.user.id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!['RESOLVED', 'CLOSED'].includes(issue.status)) {
    return res.status(400).json({ message: 'Cannot rate unresolved issue' });
  }

  issue.rating = rating;
  await issue.save();

  res.json(issue);
});
