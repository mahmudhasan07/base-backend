import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtHelpers } from "./jwtHelper";
import ApiError from "../error/ApiErrors";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

const OTPVerify = async (payload: { otp: number; token?: string, email?: string }) => {

    let decoded: JwtPayload = {};
    if (payload.token && !payload.email) {
        try {
            if (!payload.token) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Token is required");
            }
            decoded = jwtHelpers.verifyToken(payload?.token);
        } catch (error) {
            throw new ApiError(StatusCodes.CONFLICT, "Invalid or expired token");
        }
    }

    // Find user by email
    const findUser = await prisma.user.findUnique({
        where: {
            email: decoded.email || payload.email
        }
    });

    if (!findUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    // Find OTP record
    const otpRecord = await prisma.otp.findUnique({
        where: {
            email: decoded.email || payload.email
        },
        select: {
            otp: true,
            expiry: true
        }
    });

    if (!otpRecord) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "OTP not found");
    }

    // Check if OTP is expired (valid for 5 minutes)
    const currentTime = new Date();
    const otpExpiryTime = otpRecord.expiry && new Date(otpRecord.expiry) as any

    if (currentTime > otpExpiryTime) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "OTP expired");
    }

    // Verify OTP
    if (otpRecord && String(otpRecord.otp) !== String(payload.otp)) {
        throw new ApiError(StatusCodes.CONFLICT, "Invalid OTP");
    }

    // Generate new token after successful verification
    const newToken = jwtHelpers.generateToken(
        { email: findUser.email, id: findUser.id, role: findUser.role },
        { expiresIn: "1h" }
    );

    await prisma.otp.delete({
        where: {
            email: decoded.email || payload.email
        }
    })

    const result = { message: "OTP verified successfully", accessToken: newToken };

    return result
};

export default OTPVerify;
