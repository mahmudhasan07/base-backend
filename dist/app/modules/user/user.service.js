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
exports.userServices = void 0;
const client_1 = require("@prisma/client");
const ApiErrors_1 = __importDefault(require("../../error/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const OTPFn_1 = require("../../helper/OTPFn");
const app_1 = require("../../../app");
const prisma = new client_1.PrismaClient();
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });
    if (findUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.CONFLICT, "User already exists");
    }
    const newPass = yield (0, bcrypt_1.hash)(payload.password, 10);
    const result = yield prisma.user.create({
        data: Object.assign(Object.assign({}, payload), { password: newPass })
    });
    (0, OTPFn_1.OTPFn)(payload.email);
    return result;
});
// const verifyUser = async (req: Request) => {
//     const token = req.headers.authorization
//     const payload = req.body
//     const userInfo = token && jwtHelpers.tokenVerifier(token) as JwtPayload
// }
const verifyOTP = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.query.email;
    console.log(email);
    const otp = req.body;
    const getOTP = app_1.myCache.get(email);
    console.log(getOTP, otp);
    if (!getOTP) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "OTP is expired");
    }
    if (getOTP !== parseInt(otp.otp)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "OTP is not valid");
    }
    const result = yield prisma.user.update({
        where: {
            email: email
        },
        data: {
            status: 'ACTIVE'
        }
    });
    return true;
});
const updateUserFromDB = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    const payload = req.body;
    const userInfo = token && jsonwebtoken_1.default.decode(token);
    const findUser = yield prisma.user.findUnique({
        where: {
            email: userInfo && (userInfo === null || userInfo === void 0 ? void 0 : userInfo.email)
        }
    });
    if (!findUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User is not exists");
    }
    const newPass = yield (0, bcrypt_1.hash)(payload.password, 10);
    const result = yield prisma.user.update({
        where: {
            email: userInfo && (userInfo === null || userInfo === void 0 ? void 0 : userInfo.email)
        },
        data: {
            password: newPass
        }
    });
    return result;
});
exports.userServices = { createUserIntoDB, updateUserFromDB, verifyOTP };
