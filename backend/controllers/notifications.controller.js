const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// --------------------
// List notifications
// --------------------
exports.list = asyncHandler(async (req, res) => {
  const list = await Notification.find({
    userId: req.user.id,
    communityId: req.user.communityId
  }).sort({ createdAt: -1 });

  res.json(list);
});

// --------------------
// Mark all as read
// --------------------
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      userId: req.user.id,
      communityId: req.user.communityId,
      read: false
    },
    { read: true }
  );

  res.json({ ok: true });
});

// --------------------
// Mark one as read
// --------------------
exports.markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
      communityId: req.user.communityId
    },
    { read: true },
    { new: true }
  );

  if (!notif) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json({ ok: true });
});

// --------------------
// Delete notification
// --------------------
exports.remove = asyncHandler(async (req, res) => {
  const deleted = await Notification.deleteOne({
    _id: req.params.id,
    userId: req.user.id,
    communityId: req.user.communityId
  });

  if (!deleted.deletedCount) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json({ ok: true });
});


// --------------------
// Internal: Create & Emit
// --------------------
exports.create = async ({ userId, communityId, type, title, body, link }) => {
  try {
    const notification = await Notification.create({
      userId,
      communityId,
      type,
      title,
      body,
      link,
    });

    // Emit real-time event
    const io = require('../socket').getIO();
    io.to(userId.toString()).emit('notification', notification);

    return notification;
  } catch (err) {
    console.error('Notification create error:', err);
    // Don't throw, just log so main flow isn't interrupted
  }
};
