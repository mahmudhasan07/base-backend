import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { jwtHelpers } from "../../helper/jwtHelper";
import { Secret } from "jsonwebtoken";
import ApiError from "../../error/ApiErrors";
import { OTPFn } from "../../helper/OTPFn";
import OTPVerify from "../../helper/OTPVerify";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();
const logInFromDB = async (payload: { email: string, password: string, fcmToken?: string }) => {
    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (!findUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found")
    }
    const comparePassword = await compare(payload.password, findUser.password)
    if (!comparePassword) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid password")
    }

    if (findUser.status === "PENDING") {
        OTPFn(findUser.email)
        throw new ApiError(401, "Please check your email address to verify your account")
    }

    if (payload.fcmToken) {
        await prisma.user.update({
            where: {
                email: payload.email
            },
            data: {
                fcmToken: payload.fcmToken
            }
        })
    }

    const { password, ...userInfo } = findUser
    const token = jwtHelpers.generateToken(userInfo, { expiresIn: "24 hr" })
    return { accessToken: token, userInfo }
}


const verifyOtp = async (payload: { email: string; otp: number }) => {

    const { message } = await OTPVerify(payload)

    if (message) {
        const updateUserInfo = await prisma.user.update({
            where: {
                email: payload.email
            },
            data: {
                status: "ACTIVE"
            }
        })
        return updateUserInfo
    }

};

const forgetPassword = async (payload: { email: string }) => {
    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (!findUser) {
        throw new Error("User not found")
    }
    const token = jwtHelpers.generateToken({ email: findUser.email, id: findUser?.id, role: findUser?.role }, { expiresIn: "1hr" }) as Secret
    OTPFn(findUser.email)
    return { accessToken: token }
}

export const authService = { logInFromDB, forgetPassword, verifyOtp }

