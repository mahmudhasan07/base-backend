"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploader = exports.getImageUrl = void 0;
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
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE, // Automatically detect content type
    key: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // File name in Spaces
    },
});
const imageFilter = (req, file, cb) => {
    const allowedMimes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed."), false);
    }
    cb(null, true);
};
// Upload image configurations
const upload = (0, multer_1.default)({
    storage: s3Storage,
    fileFilter: imageFilter, // Apply image filter 
});
const getImageUrl = (file) => __awaiter(void 0, void 0, void 0, function* () {
    let image = file === null || file === void 0 ? void 0 : file.location;
    if (!image || !image.startsWith("http")) {
        image = `https://${process.env.DO_SPACE_BUCKET}.nyc3.digitaloceanspaces.com/${file === null || file === void 0 ? void 0 : file.key}`;
    }
    return image;
});
exports.getImageUrl = getImageUrl;
// Single image uploads
const uploadProfileImage = upload.single("profileImage");
const uploadFoodImages = upload.single("foodImage");
const serviceImage = upload.single("serviceImage");
// Multiple image uploads
exports.fileUploader = {
    upload,
    uploadProfileImage,
    uploadFoodImages,
    serviceImage
};
