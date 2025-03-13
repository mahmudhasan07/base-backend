"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const loginUser = zod_1.default.object({
    email: zod_1.default
        .string({
        required_error: "Email is required!",
    })
        .email({
        message: "Invalid email format!",
    }),
    password: zod_1.default.string({
        required_error: "Password is required!",
    }),
});
const forgotPassword = zod_1.default.object({
    email: zod_1.default
        .string({
        required_error: "Email is required!",
    })
        .email({
        message: "Invalid email format!",
    }),
});
const verifyOtp = zod_1.default.object({
    email: zod_1.default
        .string({
        required_error: "Email is required!",
    })
        .email({
        message: "Invalid email format!",
    }),
    otp: zod_1.default.number({
        required_error: "OTP is required!",
    }),
});
const changePassword = zod_1.default.object({
    newPassword: zod_1.default.string({
        required_error: "New password is required!",
    }),
});
exports.authValidation = { loginUser, forgotPassword, verifyOtp, changePassword };
