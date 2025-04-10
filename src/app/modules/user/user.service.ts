import { User } from "@prisma/client";
import ApiError from "../../error/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { compare, hash } from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import { OTPFn } from "../../helper/OTPFn";
import OTPVerify from "../../helper/OTPVerify";
import { getImageUrl } from "../../helper/uploadFile";
import { prisma } from "../../../utils/prisma";
import { jwtHelpers } from "../../helper/jwtHelper";

const createUserIntoDB = async (payload: User) => {

    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (findUser && findUser?.isVerified) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User already exists")
    }
    if (findUser && !findUser?.isVerified) {
        await OTPFn(payload.email)
        return
    }

    const newPass = await hash(payload.password, 10)

    const result = await prisma.user.create({
        data: {
            ...payload,
            password: newPass,
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
    })
    OTPFn(payload.email)
    return result
}

const changePasswordIntoDB = async (id: string, payload: any) => {

    const findUser = await prisma.user.findUnique({
        where: {
            id
        }
    })
    if (!findUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found")
    }
    try {
        await compare(payload.oldPassword, findUser.password)
        const newPass = await hash(payload.newPassword, 10)
        await prisma.user.update({
            where: {
                id
            },
            data: {
                password: newPass
            }
        })
        return

    } catch {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Old password is incorrect")
    }
}

const resetPasswordIntoDB = async (payload: any, token: string) => {
    const userInfo = jwtHelpers.tokenDecoder(token) as JwtPayload
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
        },
        select : {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return result
}

const updateUserIntoDB = async (id: string, payload: any, image: any) => {


    const userImage = await getImageUrl(image)

    try {
        const result = await prisma.user.update({
            where: {
                id
            },
            data: {
                ...payload,
                image: userImage ?? undefined
            }
        })
        const updateDetails = {
            id: result.id,
            name: result.name,
            email: result.email,
            image: result.image,
            role: result.role,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        }

        return updateDetails

    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User not found")
    }
}


export const userServices = { createUserIntoDB, resetPasswordIntoDB, updateUserIntoDB, changePasswordIntoDB }