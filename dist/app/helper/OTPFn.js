"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPFn = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const ApiErrors_1 = __importDefault(require("../error/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
// import { myCache } from '../app';
const prisma = new client_1.PrismaClient();
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // OTP valid for 5 minutes
const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);
const OTPFn = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(100000 + Math.random() * 900000);
    // console.log(`OTP for ${email} is ${otp}`);
    const transporter = nodemailer_1.default.createTransport({
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
    yield transporter.sendMail(mailOptions);
    // myCache.set(email, otp);
    const finderOTPUser = yield prisma.otp.findUnique({
        where: {
            email: email
        }
    });
    if (!finderOTPUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    const updateOTP = yield prisma.otp.upsert({
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
    });
    return updateOTP;
});
exports.OTPFn = OTPFn;
