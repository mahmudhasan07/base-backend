import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

// Configure DigitalOcean Spaces
const s3 = new S3Client({
  endpoint: process.env.DO_SPACE_ENDPOINT,
  region: "nyc3", // Replace with your region
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "", // Store in .env for security
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "", // Store in .env for security
  },
});

// Create multer storage for DigitalOcean Spaces
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.DO_SPACE_BUCKET || "", // Replace with your bucket name
  acl: "public-read", // Ensure files are publicly accessible
  contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
  key: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // File name in Spaces
  },
});

const imageFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg"];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed."), false);
  }
  cb(null, true);
};

// Upload image configurations
const upload = multer(
  {
    storage: s3Storage,
    fileFilter: imageFilter, // Apply image filter 
  },

);


export const getImageUrl = async (file: Express.MulterS3.File) => {
  let image = file?.location;
  if (!image || !image.startsWith("http")) {
    image = `https://${process.env.DO_SPACE_BUCKET}.nyc3.digitaloceanspaces.com/${file?.key}`;
  }
  return image;
};

// Single image uploads
const uploadProfileImage = upload.single("profileImage");
const uploadFoodImages = upload.single("foodImage");
const serviceImage = upload.single("serviceImage");

// Multiple image uploads

export const fileUploader = {
  upload,
  uploadProfileImage,
  uploadFoodImages,
  serviceImage
};
