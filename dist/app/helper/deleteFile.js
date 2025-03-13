"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const deleteImage = (imagePath) => {
    const fullPath = path_1.default.join(__dirname, '../../../../uploads', imagePath);
    fs_1.default.unlink(fullPath, (err) => {
        if (err) {
            console.error(`Error deleting file ${imagePath}:`, err);
            return;
        }
    });
};
exports.deleteImage = deleteImage;
