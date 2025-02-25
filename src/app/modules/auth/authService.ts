import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";
import { jwtHelpers } from "../../helper/jwtHelper";
import { Secret } from "jsonwebtoken";

const prisma = new PrismaClient();
const logInFromDB = async (payload: { email: string, password: string }) => {
    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (!findUser) {
        throw new Error("User not found")
    }
    const comparePassword = await compare(payload.password, findUser.password)
    if (!comparePassword) {
        throw new Error("Invalid password")
    }
    const { password, ...userInfo } = findUser
    const token = jwtHelpers.tokenCreator(userInfo) as Secret
    return { accessToken: token, userInfo }
}

const forgetPassword = async (payload: { email: string }) => {
    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (!findUser) {
        throw new Error("User not found")
    }
    const token = jwtHelpers.tokenCreator({ email: findUser.email, id: findUser?.id, role: findUser?.role }) as Secret
    return token
}

export const authService = {logInFromDB, forgetPassword} 

