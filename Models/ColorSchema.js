import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
    Color: String,
    ColorCode: String,    
},{timestamps:true}
)

export const Colour = mongoose.model("Color",ColorSchema)