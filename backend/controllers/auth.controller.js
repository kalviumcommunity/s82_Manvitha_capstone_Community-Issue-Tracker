const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Approval = require("../models/Approval");
const NotificationController = require("./notifications.controller");
const { sign } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");

// ---------- Current User ----------
exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  
  const userObj = user.toObject();
  if (userObj.role === 'RESIDENT' && !userObj.communityId) {
    const lastApproval = await Approval.findOne({ requesterId: user._id })
      .sort({ createdAt: -1 })
      .populate('communityId', 'name location');
    userObj.lastApproval = lastApproval;
  }
  
  res.json(userObj);
});

// ---------- Signup ----------
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, communityId, phoneNumber, houseNo, ownerName } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  
  // For Resident, we don't set communityId directly on signup. It starts as null/pending approval.
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    communityId: role === 'PRESIDENT' ? undefined : null,
    phoneNumber,
    profile: { houseNo, ownerName }
  });

  // Create pending approval request for resident
  if (role === 'RESIDENT' && communityId) {
    console.log(`[Signup Debug] Creating RESIDENT_JOIN approval for user: ${user._id} (${user.name}) and communityId: ${communityId}`);
    const app = await Approval.create({
      type: 'RESIDENT_JOIN',
      communityId,
      requesterId: user._id,
      status: 'PENDING'
    });
    console.log(`[Signup Debug] Created approval ID: ${app._id}`);

    // Notify all community presidents
    const presidents = await User.find({ communityId, role: 'PRESIDENT' });
    presidents.forEach(p => {
      NotificationController.create({
        userId: p._id,
        communityId,
        type: 'JOIN_REQUEST',
        title: 'New Join Request',
        body: `${user.name} has requested to join your community.`,
        link: '/president/manage-community'
      });
    });
  } else {
    console.log(`[Signup Debug] User is not a resident or did not specify communityId. role: ${role}, communityId: ${communityId}`);
  }

  // Auto-login after signup
  const token = sign(
    { id: user._id, role: user.role, communityId: user.communityId },
    "1d"
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  // Include lastApproval info in the signup response for immediate frontend state evaluation
  const userObj = {
    id: user._id,
    name: user.name,
    role: user.role,
    communityId: user.communityId,
  };

  if (role === 'RESIDENT' && communityId) {
    const lastApproval = await Approval.findOne({ requesterId: user._id })
      .sort({ createdAt: -1 })
      .populate('communityId', 'name location');
    userObj.lastApproval = lastApproval;
  }

  res.status(201).json({
    message: "Signup successful",
    user: userObj,
  });
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

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      communityId: user.communityId,
    },
  });
});

// ---------- Update Me ----------
exports.updateMe = asyncHandler(async (req, res) => {
  const { name, phoneNumber, houseNo, ownerName } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name;
  if (phoneNumber) user.phoneNumber = phoneNumber;

  if (user.role === 'RESIDENT') {
    if (houseNo) user.profile.houseNo = houseNo;
    if (ownerName) user.profile.ownerName = ownerName;
  }

  await user.save();

  res.json({
    message: "Profile updated",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      communityId: user.communityId,
      phoneNumber: user.phoneNumber,
      profile: user.profile
    }
  });
});

// ---------- Logout ----------
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logged out" });
});
