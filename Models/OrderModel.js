import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: { type: mongoose.Schema.Types.ObjectId, required: true },
        sizeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Size",
          required: true,
        },
        quantity: { type: Number, required: true },
        amount: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    delieveryCharge: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true },
    couponCode: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    orderNumber: { type: String, required: true, unique: true },
    status: { type: String, default: "Pending" },
    paymentMethod: { type: String, enum: ["Online", "COD"], required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: { type: String, default: "Pending" },
    orderStatus: {
      type: String,
      enum: ["Pending", "Complete", "Cancel"],
      default: "Pending",
    },
    DeliveryDate: { type: Date },
  },
  { timestamps: true }
);

export const order = mongoose.model("Order", OrderSchema);
