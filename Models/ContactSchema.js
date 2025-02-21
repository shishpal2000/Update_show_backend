import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  address: { type: String },
  PhoneNumber: { type: Number },
  fb: { type: String },
  linkedin: { type: String },
  insta: { type: String },
  twitter: { type: String },
  link1: { type: String },
  link2: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Contact = mongoose.model("Contact", ContactSchema);
