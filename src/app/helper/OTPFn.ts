import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import ApiError from '../error/ApiErrors';
import { StatusCodes } from 'http-status-codes';
// import { myCache } from '../app';
const prisma = new PrismaClient();

const OTP_EXPIRY_TIME = 5 * 60 * 1000; // OTP valid for 5 minutes
const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

export const OTPFn = async (email: string) => {

    const otp = Math.floor(100000 + Math.random() * 900000);


    // console.log(`OTP for ${email} is ${otp}`);
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service provider
        auth: {
            user: 'mahmudhasan.hb@gmail.com', // Your email address
            pass: process.env.MAIL_PASS // Your email password
        }
    });

    // Set up email data
    const mailOptions = {
        from: '"EcomGrove" <mahmudhasan.hb@gmail.com>', // Sender address
        to: email, // List of receivers
        subject: 'Your OTP Code', // Subject line
        // text: `Your OTP code is ${otp}` // Plain text body
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Your OTP Code</h2>
                <p style="font-size: 16px; color: #555;">Hello,</p>
                <p style="font-size: 16px; color: #555;">Your OTP code is:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #333; padding: 10px 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">${otp}</span>
                </div>
                <p style="font-size: 16px; color: #555;">Please use this code to complete your verification. This code is valid for 10 minutes.</p>
                <p style="font-size: 16px; color: #555;">If you did not request this code, please ignore this email.</p>
                <p style="font-size: 16px; color: #555;">Thank you,</p>
                <p style="font-size: 16px; color: #555;">The EcomGrove Team</p>
            </div>` // HTML body
    };

    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);
    // myCache.set(email, otp);

    const finderOTPUser = await prisma.otp.findUnique({
        where: {
            email: email
        }
    })

    if (!finderOTPUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

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