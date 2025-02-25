"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelpers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenCreator = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "24h" });
    return token;
};
const tokenVerifier = (token) => {
    const verified = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
    return verified;
};
const tokenDecoder = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    return decoded;
};
exports.jwtHelpers = {
    tokenCreator,
    tokenVerifier,
    tokenDecoder
};
