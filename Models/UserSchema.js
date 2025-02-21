import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  Firstname: { type: String, required: true },
  Lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phonenumber: { type: Number },
  role: { type: String, default: "user" },
  password: {
    type: String,
    minLength: [6, "password must be at least 6 characters"],
    select: false,
  },
  googleId: { type: String },
  facebookId: { type: String },
  otp: { type: String },
  otpExpiration: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("User", UserSchema);
