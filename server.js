import app from "./app.js"
import { connectDb } from "./database.js";
import cloudinary from "cloudinary";


connectDb();

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

const port = process.env.PORT;


app.listen(port, () => {
    console.log(`Server is working on port ${port}`);
 });