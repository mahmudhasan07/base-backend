import { prisma } from "../../utils/prisma";
import ApiError from "../error/ApiErrors";
import { StatusCodes } from "http-status-codes";

const MAX_ATTEMPTS = 5;

const OTPVerify = async (payload: { email: string; otp: number }) => {
  const email = payload.email.trim().toLowerCase();
  const now = new Date();

  const otpRecord = await prisma.otp.findUnique({ where: { email } });

  if (!otpRecord) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired OTP");
  }

  // Check expiry
  if (!otpRecord.expiry || now > otpRecord.expiry) {
    await prisma.otp.delete({ where: { email } });
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired OTP");
  }

  // Wrong OTP
  if (otpRecord.otp !== payload.otp) {
    const newAttempts = otpRecord.attempts + 1;

    if (newAttempts >= MAX_ATTEMPTS) {
      // Delete OTP after 5 wrong attempts
      await prisma.otp.delete({ where: { email } });
    } else {
      // Increment attempts
      await prisma.otp.update({
        where: { email },
        data: { attempts: newAttempts },
      });
    }

    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired OTP");
  }

  // Correct OTP → delete OTP
  await prisma.otp.delete({ where: { email } });

  return { message: "OTP verified successfully" };
};

export default OTPVerify;
