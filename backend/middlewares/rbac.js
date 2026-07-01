module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userRole = req.user.role.toUpperCase();
  const allowedRoles = roles.map(r => r.toUpperCase());

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};
