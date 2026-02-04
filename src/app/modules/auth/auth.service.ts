import { PrismaClient, Role } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { jwtHelpers } from "../../helper/jwtHelper";
import { JwtPayload, Secret } from "jsonwebtoken";
import ApiError from "../../error/ApiErrors";
import { OTPFn } from "../../helper/OTPFn";
import OTPVerify from "../../helper/OTPVerify";
import { StatusCodes } from "http-status-codes";
import { createStripeCustomerAcc } from "../../helper/createStripeCustomerAcc";

const prisma = new PrismaClient();
const logInFromDB = async (payload: { email: string; password: string; fcmToken?: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.trim() },
  });

  if (!user || !user.password) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    // Format the lockUntil date to a readable string
    const unlockTime = user.lockUntil.toLocaleString("en-US", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      `Too many failed attempts. You can try again after ${unlockTime} or reset your password`
    );
  }

  // Check verification
  if (user.status === "PENDING" && !user.isVerified) {
    OTPFn(user.email);
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Please verify your email before logging in"
    );
  }

  const isMatch = await compare(payload.password, user.password);

  if (!isMatch) {
    let updateData: any = { attempts: user.attempts + 1 };

    // Lock account if attempts >= 5
    if (updateData.attempts >= 5) {
      updateData.lockUntil = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
      updateData.attempts = 0; // reset attempts after locking
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  // Successful login → reset attempts & lockUntil
  await prisma.user.update({
    where: { id: user.id },
    data: { attempts: 0, lockUntil: null, fcmToken: payload.fcmToken ?? user.fcmToken },
  });

  const safeUserInfo = {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    status: user.status,
    fcmToken: payload.fcmToken ?? user.fcmToken,
  };

  const tokenPayload = { id: user.id, role: user.role };
  const accessToken = jwtHelpers.generateToken(tokenPayload, "LOGIN");

  return { accessToken, user: safeUserInfo };
};



const verifyOtp = async (payload: { email: string; otp: number }) => {
  const { message } = await OTPVerify({ ...payload });

  if (message) {
    const updateUserInfo = await prisma.user.update({
      where: {
        email: payload.email,
      },
      data: {
        status: "ACTIVE",
        isVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await createStripeCustomerAcc(updateUserInfo);
    return updateUserInfo;
  }
};

const forgetPassword = async (payload: { email: string }) => {
  const findUser = await prisma.user.findUnique({
    where: {
      email: payload.email.trim(),
    },
  });
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  OTPFn(findUser.email);
  return;
};

const resetOtpVerify = async (payload: { email: string; otp: number }) => {
  const { message } = await OTPVerify({ ...payload });

  if (message) {
    const accessToken = jwtHelpers.generateToken(
      { email: payload.email },
      "PASSWORD_RESET"
    );
    return accessToken;
  }
};

const resendOtp = async (payload: { email: string }) => {
  const findUser = await prisma.user.findUnique({
    where: {
      email: payload.email.trim(),
    },
  });
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  OTPFn(findUser.email);
};

const socialLogin = async (payload: {
  email: string;
  name: string;
  role: Role;
  image?: string;
}) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email.trim(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      customerId: true,
      status: true,
      connectAccountId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (userData) {
    const accessToken = jwtHelpers.generateToken(
      { id: userData.id, email: userData.email, role: userData.role },
      "LOGIN"
    );
    return {
      ...userData,
      accessToken,
    };
  } else {
    const result = await prisma.user.create({
      data: {
        ...payload,
        password: "",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        customerId: true,
        status: true,
        connectAccountId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await createStripeCustomerAcc(result);

    const accessToken = jwtHelpers.generateToken(
      { id: result.id, email: result.email, role: result.role },
      "LOGIN"
    );
    return {
      ...result,
      accessToken,
    };
  }
};

const resetPassword = async (payload: { token: string; password: string }) => {
  let decoded: JwtPayload;
  try {
    decoded = jwtHelpers.verifyToken(payload.token) as JwtPayload; // verifies signature
  } catch (err) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token");
  }

  const { email } = decoded;

  const findUser = await prisma.user.findUnique({ where: { email } });
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isSamePassword = await compare(payload.password, findUser.password);
  if (isSamePassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password should be different from old password"
    );
  }

  const hashedPassword = await hash(payload.password, 10);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};


export const authService = {
  logInFromDB,
  forgetPassword,
  verifyOtp,
  resendOtp,
  socialLogin,
  resetOtpVerify,
  resetPassword,
};
