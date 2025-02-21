import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: "dbibpsvgt",
  api_key: "162653689379811",
  api_secret: "CAwPjiZv1BWvYi9pXdC-dJ5pfeM",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      throw new Error("Invalid file type. Only images and videos are allowed.");
    }

    return {
      folder: "uploads",
      allowed_formats: isImage ? ["jpg", "jpeg", "png"] : ["mp4", "avi", "mov"], // Separate formats for images and videos
      resource_type: isVideo ? "video" : "image",
    };
  },
});

const upload = multer({ storage });

const cpUpload0 = upload.fields([
  { name: "images", maxCount: 20 },
  { name: "image", maxCount: 1 },
  { name: "userImg", maxCount: 5 },
  { name: "videos", maxCount: 1 },
]);

export default cpUpload0;
