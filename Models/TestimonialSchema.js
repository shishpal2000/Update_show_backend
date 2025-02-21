import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  UserName:{type:String} ,
  Rating: { type: Number },
  UserImg: [
    {
      public_id: { type: String },
      url: {
        type: String,
      },
    }
  ],
  Images: [
    {
      public_id: { type: String },
      url: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Testimonial = mongoose.model("Testimonial", TestimonialSchema);
