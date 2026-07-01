const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    console.log(`[Auth Debug] Origin: ${req.headers.origin} | Referer: ${req.headers.referer}`);
    console.log(`[Auth Debug] Raw Cookie Header: ${req.headers.cookie}`);
    console.log(`[Auth Debug] Cookies:`, req.cookies);
    const token = req.cookies?.token;

    if (!token) {
      console.warn(`[Auth] No token found for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[Auth Debug] Decoded Payload:`, decoded);

    if (!decoded?.id) {
      console.warn('[Auth] Invalid token payload');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Fetch fresh user from DB to ensure roles are always up-to-date
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      console.warn(`[Auth] User not found: ${decoded.id}`);
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      console.warn(`[Auth] Inactive user: ${user.email} (${user.status})`);
      return res.status(403).json({ message: 'User account is not active' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth] Error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
