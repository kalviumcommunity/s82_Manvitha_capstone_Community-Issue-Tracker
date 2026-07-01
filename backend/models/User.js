const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["PRESIDENT", "RESIDENT"], // ✅ secretary removed
      required: true,
      index: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      index: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DEACTIVATED"],
      default: "ACTIVE",
      index: true,
    },
    profile: {
      houseNo: { type: String, trim: true },
      block: { type: String, trim: true },
      occupation: { type: String, trim: true },
      ownerName: { type: String, trim: true },
      dob: Date,
    },
  },
  { timestamps: true }
);

// Helpful compound index
UserSchema.index({ communityId: 1, role: 1 });

module.exports =
  mongoose.models.User || mongoose.model("User", UserSchema);
