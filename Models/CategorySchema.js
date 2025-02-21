import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: String,
    badge: String,
    poster: [
      {
        public_id: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
