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
exports.deleteFile = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const client_s3_1 = require("@aws-sdk/client-s3");
const S3_1 = require("./S3");
const deleteUploadImage = (imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fullPath = path_1.default.join(__dirname, "../../../uploads", imagePath);
        console.log("Full path:", fullPath); // Debugging
        yield promises_1.default.unlink(fullPath);
        return true; // Indicate success
    }
    catch (err) {
        console.error(`Error deleting file ${imagePath}:`, err);
        return false; // Throw the error so it can be caught where the function is called
    }
});
const deleteS3Image = (imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!imagePath) {
        console.warn("No image path provided");
        return false;
    }
    try {
        // Use DeleteObjectCommand
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.DO_SPACE_BUCKET,
            Key: imagePath,
        });
        yield S3_1.s3.send(command);
        return true;
    }
    catch (err) {
        return false;
    }
});
exports.deleteFile = { deleteUploadImage, deleteS3Image };
