import { PrismaClient } from '@prisma/client';
import { sendEmailFn } from './sendMailFn';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const OTPFn = async (email: string) => {
    const OTP_EXPIRY_TIME = 5 * 60 * 1000; // OTP valid for 5 minutes
    const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);
     const otp = crypto.randomInt(100000, 999999); // range: [100000, 999999]
    await sendEmailFn({ email, type: "otp", otp })

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