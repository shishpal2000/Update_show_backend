import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema({
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Category",
    },
    name: String,
    
},{timestamps:true}
)

export const Subcategory = mongoose.model("Subcategory",SubcategorySchema)