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
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtHelper_1 = require("./jwtHelper");
const prisma = new client_1.PrismaClient();
const OTPVerify = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify the token
    let decoded;
    try {
        if (!payload.token) {
            throw new Error("Token is required");
        }
        decoded = jwtHelper_1.jwtHelpers.verifyToken(payload.token);
    }
    catch (error) {
        throw new Error("Invalid or expired token");
    }
    // Find user by email
    const findUser = yield prisma.user.findUnique({
        where: {
            email: decoded.email || payload.email
        }
    });
    if (!findUser) {
        throw new Error("User not found");
    }
    // Find OTP record
    const otpRecord = yield prisma.otp.findUnique({
        where: {
            email: decoded.email || payload.email
        },
        select: {
            otp: true,
            expiry: true
        }
    });
    if (!otpRecord) {
        throw new Error("OTP not found");
    }
    // Check if OTP is expired (valid for 5 minutes)
    const currentTime = new Date();
    const otpExpiryTime = otpRecord.expiry && new Date(otpRecord.expiry);
    if (currentTime > otpExpiryTime) {
        throw new Error("OTP expired");
    }
    // Verify OTP
    if (otpRecord && String(otpRecord.otp) !== String(payload.otp)) {
        throw new Error("Invalid OTP");
    }
    // Generate new token after successful verification
    const newToken = jsonwebtoken_1.default.sign({ email: findUser.email, id: findUser.id, role: findUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const result = { message: "OTP verified successfully", token: newToken };
    return result;
});
exports.default = OTPVerify;
