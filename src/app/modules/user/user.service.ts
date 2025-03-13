import { PrismaClient, User } from "@prisma/client";
import ApiError from "../../error/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { hash } from "bcrypt"
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { jwtHelpers } from "../../helper/jwtHelper";
import { OTPFn } from "../../helper/OTPFn";
import { myCache } from "../../../app";

const prisma = new PrismaClient();

const createUserIntoDB = async (payload: User) => {

    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (findUser) {
        throw new ApiError(StatusCodes.CONFLICT, "User already exists")
    }

    const newPass = await hash(payload.password, 10)

    const result = await prisma.user.create({
        data: {
            ...payload,
            password: newPass
        }
    })

    OTPFn(payload.email)

    return result
}


// const verifyUser = async (req: Request) => {
//     const token = req.headers.authorization
//     const payload = req.body
//     const userInfo = token && jwtHelpers.tokenVerifier(token) as JwtPayload


// }

const verifyOTP = async (req: Request) => {
    const email = req.query.email as string
    console.log(email)
    
    const otp = req.body
    const getOTP = myCache.get(email)
    console.log(getOTP, otp);
    
    if (!getOTP) {
        throw new ApiError(StatusCodes.NOT_FOUND, "OTP is expired")
    }
    if (getOTP !== parseInt(otp.otp)) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "OTP is not valid")
    }
    const result = await prisma.user.update({
        where: {
            email: email
        },
        data: {
            status: 'ACTIVE'
        }
    })
    return true
}



const updateUserFromDB = async (req: Request) => {
    const token = req.headers.authorization
    const payload = req.body
    const userInfo = token && jwt.decode(token) as { id: string, email: string }
    const findUser = await prisma.user.findUnique({
        where: {
            email: userInfo && userInfo?.email
        }
    })
    if (!findUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User is not exists")
    }

    const newPass = await hash(payload.password, 10)
    const result = await prisma.user.update({
        where: {
            email: userInfo && userInfo?.email
        },
        data: {
            password: newPass
        }
    })

    return result
}


export const userServices = { createUserIntoDB, updateUserFromDB, verifyOTP }