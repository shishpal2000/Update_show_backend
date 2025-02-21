import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Product: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // Variant ID for the specific product variant
      },
      sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Size",
      },
      count: { type: Number },
      Price: { type: Number },
    },
  ],

  TotalItems: {
    type: Number,
    required: true,
    default: 1,
  },
  TotalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  ShippingCharge: {
    type: Number,
    default: 0,
  },
  couponCode: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  discount: {
    type: Number,
    default: 0,
  },
  paymentMethod: { type: String, enum: ["Online", "COD"], default: "Online" },
  FinaltotalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const Cart = mongoose.model("Cart", cartSchema);
