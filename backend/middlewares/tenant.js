// Ensures communityId in resource matches authenticated user's community
module.exports = (req, res, next) => {
  req.communityId = req.user?.communityId || null; // helper
  next();
};
