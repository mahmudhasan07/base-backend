import { PrismaClient } from '@prisma/client';
import { sendEmailFn } from './sendMailFn';

const prisma = new PrismaClient();

export const OTPFn = async (email: string) => {
    const OTP_EXPIRY_TIME = 5 * 60 * 1000; // OTP valid for 5 minutes
    const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);
    const otp = Math.floor(100000 + Math.random() * 900000);

    await sendEmailFn(email, otp)

    const updateOTP = await prisma.otp.upsert({
        where: {
            email: email
        },
        update: {
            otp: otp,
            expiry: expiry
        },
        create: {
            email: email,
            otp: otp,
            expiry: expiry
        }
    })

    return updateOTP
}