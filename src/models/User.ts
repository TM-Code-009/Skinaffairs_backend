import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

export default mongoose.model("User", UserSchema);