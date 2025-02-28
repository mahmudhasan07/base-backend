import path from "path";
import fs from "fs";
export const deleteImage = (imagePath: string) => {
    const fullPath = path.join(__dirname, '../../../../uploads', imagePath);
    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error(`Error deleting file ${imagePath}:`, err);
            return
        }
    });
};