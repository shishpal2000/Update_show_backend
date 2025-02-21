import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema(
  {
    Size: String,
  },
  { timestamps: true }
);

export const Size = mongoose.model("Size", SizeSchema);
