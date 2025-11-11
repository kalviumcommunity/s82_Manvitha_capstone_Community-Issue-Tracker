const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sign } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");

// ---------- Signup ----------
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  res.status(201).json({ id: user._id });
});

// ---------- Login ----------
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = sign(
    { id: user._id, role: user.role, communityId: user.communityId },
    "1d"
  );

  // send cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.json({
    message: "Login successful",
    user: { id: user._id, name: user.name, role: user.role },
  });
});

// ---------- Logout ----------
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});
