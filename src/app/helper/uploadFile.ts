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
  key: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // File name in Spaces
  },
});

// Upload image configurations
const upload = multer({ storage: s3Storage });

// Single image uploads
const uploadProfileImage = upload.single("profileImage");
const uploadProductImages = upload.array("productImages");
// const uploadPackageImage = upload.single("packageImage");
// const uploadServiceImage = upload.single("serviceImage");
// const uploadPortifiloImage = upload.single("portifolioImage");

// Multiple image uploads

export const fileUploader = {
  upload,
  uploadProfileImage,
  uploadProductImages
  // uploadPackageImage,
  // uploadServiceImage,
  // uploadPortifiloImage,
};
