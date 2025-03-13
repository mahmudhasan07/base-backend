"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_s3_1 = __importDefault(require("multer-s3"));
// Configure DigitalOcean Spaces
const s3 = new client_s3_1.S3Client({
    endpoint: process.env.DO_SPACE_ENDPOINT,
    region: "nyc3", // Replace with your region
    credentials: {
        accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "", // Store in .env for security
        secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "", // Store in .env for security
    },
});
// Create multer storage for DigitalOcean Spaces
const s3Storage = (0, multer_s3_1.default)({
    s3: s3,
    bucket: process.env.DO_SPACE_BUCKET || "", // Replace with your bucket name
    acl: "public-read", // Ensure files are publicly accessible
    key: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // File name in Spaces
    },
});
// Upload image configurations
const upload = (0, multer_1.default)({ storage: s3Storage });
// Single image uploads
const uploadProfileImage = upload.single("profileImage");
const uploadProductImages = upload.array("productImages");
// const uploadPackageImage = upload.single("packageImage");
// const uploadServiceImage = upload.single("serviceImage");
// const uploadPortifiloImage = upload.single("portifolioImage");
// Multiple image uploads
exports.fileUploader = {
    upload,
    uploadProfileImage,
    uploadProductImages
    // uploadPackageImage,
    // uploadServiceImage,
    // uploadPortifiloImage,
};
