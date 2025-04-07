import { PrismaClient, User } from "@prisma/client";
import ApiError from "../../error/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { hash } from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import { OTPFn } from "../../helper/OTPFn";
import OTPVerify from "../../helper/OTPVerify";

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
            password: newPass,
            status: "ACTIVE"
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
    // OTPFn(payload.email)
    return result
}


const passwordChangeIntoDB = async (payload: any, token: string) => {

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

const updateUserIntoDB = async (id: string, payload: any, image: any) => {

    const userImage = image?.location

    try {
        const update = await prisma.user.update({
            where: {
                id
            },
            data: {
                ...payload,
                image: userImage ?? undefined
            }
        })

        return update

    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User not found")
    }
}


export const userServices = { createUserIntoDB, passwordChangeIntoDB, updateUserIntoDB }