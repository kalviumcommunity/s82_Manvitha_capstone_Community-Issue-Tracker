const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true }, // ✅ correct field
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["PRESIDENT", "SECRETARY", "RESIDENT"], required: true },
  communityId: { type: Schema.Types.ObjectId, ref: "Community" },
  avatarUrl: String,
  status: {
    type: String,
    enum: ["ACTIVE", "SUSPENDED", "DEACTIVATED"],
    default: "ACTIVE"
  },
  profile: {
    houseNo: String,
    block: String,
    occupation: String,
    dob: Date
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
