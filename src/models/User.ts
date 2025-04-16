import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: false }); // _id: false prevents auto-generating an _id for each address

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, required: true },
    birthday: { type: Date, required: true },
    phonenumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    address: {
      type: [addressSchema],
      validate: [arrayLimit, '{PATH} exceeds the limit of 3']
    }
  },
  { timestamps: true }
);

// Custom validator to limit the address array length
function arrayLimit(val: any[]) {
  return val.length <= 3;
}

export default mongoose.model("User", UserSchema);
