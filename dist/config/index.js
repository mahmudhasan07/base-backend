"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
// export const port = process.env.PORT  
// export const jwt_secret = process.env.TOKEN_SECRET
exports.default = {
    port: process.env.PORT,
    secretToken: process.env.TOKEN_SECRET,
    jwt_secret: process.env.TOKEN_SECRET
};
