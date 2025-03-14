"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelpers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const generateToken = (payload, expiresIn) => {
    // const token = jwt.sign(payload, secret, options);
    const token = jsonwebtoken_1.default.sign(payload, config_1.default.secretToken, { expiresIn: expiresIn.expiresIn, algorithm: 'HS256', });
    return token;
};
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.secretToken);
};
const tokenDecoder = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    return decoded;
};
exports.jwtHelpers = {
    generateToken,
    verifyToken,
    tokenDecoder
};
