import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtHelpers } from "./jwtHelper";

const prisma = new PrismaClient();

const OTPVerify = async (payload: { otp: number; token?: string, email?: string }) => {
    // Verify the token
    let decoded: JwtPayload;
    try {
        if (!payload.token) {
            throw new Error("Token is required");
        }
        decoded = jwtHelpers.verifyToken(payload.token);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }

    // Find user by email
    const findUser = await prisma.user.findUnique({
        where: {
            email: decoded.email || payload.email
        }
    });

    if (!findUser) {
        throw new Error("User not found");
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
        throw new Error("OTP not found");
    }

    // Check if OTP is expired (valid for 5 minutes)
    const currentTime = new Date();
    const otpExpiryTime = otpRecord.expiry && new Date(otpRecord.expiry) as any;

    if (currentTime > otpExpiryTime) {
        throw new Error("OTP expired");
    }

    // Verify OTP
    if (otpRecord && String(otpRecord.otp) !== String(payload.otp)) {
        throw new Error("Invalid OTP");
    }

    // Generate new token after successful verification
    const newToken = jwt.sign(
        { email: findUser.email, id: findUser.id, role: findUser.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    const result = { message: "OTP verified successfully", token: newToken };

    return result
};

export default OTPVerify;
