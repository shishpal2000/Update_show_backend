import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  company: { type: String },
  streetAddress: { type: String, required: true },
  aptSuiteUnit: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phone: { type: String, required: true },
  postalCode: { type: String, required: true },
  deliveryInstruction: { type: String },
  type: { type: String, enum: ["Shipping", "Billing"], required: true },
  isDefault: { type: Boolean, default: false },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Address = mongoose.model("Address", AddressSchema);
