import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, required: true },
    birthday: { type: Date, required: true }, // Store as Date instead of String
    phonenumber: { type: String, required: true }, // Store as String to prevent issues
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

export default mongoose.model("User", UserSchema);
