import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient
export const PrismaConnection = async () => {
    const User = await prisma.user.findUnique({
        where: {
            email: "admin123@gmail.com"
        }
    })
    // console.log(User);


    const newPass = await hash(process.env.ADMIN_PASS as string, 10)

    if (!User) {
        const createUser = await prisma.user.create({
            data: {
                email: "admin123@gmail.com",
                password: newPass,
                status: "ACTIVE",
                role: "ADMIN"
            }
        })

        return
    }
}