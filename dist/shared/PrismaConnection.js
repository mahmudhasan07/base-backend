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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaConnection = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const prisma = new client_1.PrismaClient;
const PrismaConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    const User = yield prisma.user.findUnique({
        where: {
            email: "admin123@gmail.com"
        }
    });
    // console.log(User);
    const newPass = yield (0, bcrypt_1.hash)(process.env.ADMIN_PASS, 10);
    if (!User) {
        const createUser = yield prisma.user.create({
            data: {
                email: "admin123@gmail.com",
                password: newPass,
                role: "ADMIN",
                status: "ACTIVE",
            }
        });
        return;
    }
});
exports.PrismaConnection = PrismaConnection;
