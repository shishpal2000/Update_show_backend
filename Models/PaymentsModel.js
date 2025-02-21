import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: { type: String, default: "Pending" },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
}, { timestamps: true });

export const payment  = mongoose.model('Payment', PaymentSchema);