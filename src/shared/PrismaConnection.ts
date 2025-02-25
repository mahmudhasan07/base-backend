import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient
export const PrismaConnection = async () => {
    const User = await prisma.user.findMany()

    const newPass = await hash(process.env.DATABASE_URL as string, 10)

    if (User?.length <= 0) {
        const createUser = await prisma.user.create({
            data: {
                email: "admin123@example.com",
                password: newPass
            }
        })
    }
}