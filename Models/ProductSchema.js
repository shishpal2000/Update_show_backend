import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  sku: { type: String },

  poster: [
    {
      public_id: String,
      url: String,
    },
  ],
  videos: [
    {
      public_id: String,
      url: String,
    },
  ],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  Subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  variants: [
    {
     
      color: { type: mongoose.Schema.Types.ObjectId, ref: "Color" },
      Size: [{
        size: { type: mongoose.Schema.Types.ObjectId, ref: "Size" },
      }],
      price: { type: Number },
      quantity: { type: Number },
    },
  ],
  stock: { type: Number, required: true },
  ratings: [
    {
      rate: Number,
    },
  ],
  Brand: { type: String },
  SoleMaterial: { type: String },
  Fastening: { type: String },
  Gender: { type: String },
  Type: { type: String },
  ToeShape: {
    type: String,
  },
  NumOfreviews: {
    type: Number,
    required: true,
    default: 1,
  },
  isWishlist: {
    type: Boolean,
    default: false,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
      name: {
        type: String,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", productSchema);
