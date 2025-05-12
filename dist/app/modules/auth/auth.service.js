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
exports.authService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const jwtHelper_1 = require("../../helper/jwtHelper");
const ApiErrors_1 = __importDefault(require("../../error/ApiErrors"));
const OTPFn_1 = require("../../helper/OTPFn");
const OTPVerify_1 = __importDefault(require("../../helper/OTPVerify"));
const http_status_codes_1 = require("http-status-codes");
const prisma = new client_1.PrismaClient();
const logInFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });
    if (!findUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    const comparePassword = yield (0, bcrypt_1.compare)(payload.password, findUser.password);
    if (!comparePassword) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NON_AUTHORITATIVE_INFORMATION, "Invalid password");
    }
    if (findUser.status === "PENDING") {
        (0, OTPFn_1.OTPFn)(findUser.email);
        throw new ApiErrors_1.default(401, "Please check your email address to verify your account");
    }
    if (payload.fcmToken) {
        yield prisma.user.update({
            where: {
                email: payload.email
            },
            data: {
                fcmToken: payload.fcmToken
            }
        });
    }
    const userInfo = {
        email: findUser.email,
        name: findUser.name,
        id: findUser.id,
        image: findUser.image,
        role: findUser.role,
        status: findUser.status,
        fcmToken: findUser.fcmToken,
    };
    const token = jwtHelper_1.jwtHelpers.generateToken(userInfo, { expiresIn: "24 hr" });
    return Object.assign({ accessToken: token }, userInfo);
});
const verifyOtp = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = yield (0, OTPVerify_1.default)(payload);
    if (message) {
        const updateUserInfo = yield prisma.user.update({
            where: {
                email: payload.email
            },
            data: {
                status: "ACTIVE",
                isVerified: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return updateUserInfo;
    }
});
const verifyRestOtp = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken } = yield (0, OTPVerify_1.default)(payload);
    return accessToken;
});
const forgetPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });
    if (!findUser) {
        throw new Error("User not found");
    }
    const token = jwtHelper_1.jwtHelpers.generateToken({ email: findUser.email, id: findUser === null || findUser === void 0 ? void 0 : findUser.id, role: findUser === null || findUser === void 0 ? void 0 : findUser.role }, { expiresIn: "1hr" });
    (0, OTPFn_1.OTPFn)(findUser.email);
    return { accessToken: token };
});
const resendOtp = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });
    if (!findUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    (0, OTPFn_1.OTPFn)(findUser.email);
});
exports.authService = { logInFromDB, forgetPassword, verifyOtp, resendOtp, verifyRestOtp };
