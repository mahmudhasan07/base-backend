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
const ApiErrors_1 = __importDefault(require("../../error/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const bcrypt_1 = require("bcrypt");
const OTPFn_1 = require("../../helper/OTPFn");
const uploadFile_1 = require("../../helper/uploadFile");
const prisma_1 = require("../../../utils/prisma");
const jwtHelper_1 = require("../../helper/jwtHelper");
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield prisma_1.prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });
    if (findUser && (findUser === null || findUser === void 0 ? void 0 : findUser.isVerified)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User already exists");
    }
    if (findUser && !(findUser === null || findUser === void 0 ? void 0 : findUser.isVerified)) {
        yield (0, OTPFn_1.OTPFn)(payload.email);
        return;
    }
    const newPass = yield (0, bcrypt_1.hash)(payload.password, 10);
    const result = yield prisma_1.prisma.user.create({
        data: Object.assign(Object.assign({}, payload), { password: newPass }),
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    });
    (0, OTPFn_1.OTPFn)(payload.email);
    return result;
});
const changePasswordIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield prisma_1.prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!findUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    try {
        yield (0, bcrypt_1.compare)(payload.oldPassword, findUser.password);
        const newPass = yield (0, bcrypt_1.hash)(payload.newPassword, 10);
        yield prisma_1.prisma.user.update({
            where: {
                id
            },
            data: {
                password: newPass
            }
        });
        return;
    }
    catch (_a) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Old password is incorrect");
    }
});
const resetPasswordIntoDB = (payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = jwtHelper_1.jwtHelpers.tokenDecoder(token);
    const findUser = yield prisma_1.prisma.user.findUnique({
        where: {
            email: userInfo && (userInfo === null || userInfo === void 0 ? void 0 : userInfo.email)
        }
    });
    if (!findUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User is not exists");
    }
    const newPass = yield (0, bcrypt_1.hash)(payload.password, 10);
    const result = yield prisma_1.prisma.user.update({
        where: {
            email: userInfo && (userInfo === null || userInfo === void 0 ? void 0 : userInfo.email)
        },
        data: {
            password: newPass
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return result;
});
const updateUserIntoDB = (id, payload, image) => __awaiter(void 0, void 0, void 0, function* () {
    const userImage = yield (0, uploadFile_1.getImageUrl)(image);
    try {
        const result = yield prisma_1.prisma.user.update({
            where: {
                id
            },
            data: Object.assign(Object.assign({}, payload), { image: userImage !== null && userImage !== void 0 ? userImage : undefined })
        });
        const updateDetails = {
            id: result.id,
            name: result.name,
            email: result.email,
            image: result.image,
            role: result.role,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
        return updateDetails;
    }
    catch (error) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User not found");
    }
});
const getMyProfile = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return result;
});
exports.userServices = { createUserIntoDB, resetPasswordIntoDB, updateUserIntoDB, changePasswordIntoDB, getMyProfile };
