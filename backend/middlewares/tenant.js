module.exports = (req, res, next) => {
  if (!req.user || !req.user.communityId) {
    return res.status(403).json({ message: 'User not associated with a community' });
  }

  // Attach once so controllers can rely on it
  req.communityId = req.user.communityId;
  next();
};
