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
const logInFromDB = async (payload: {
  email: string;
  password: string;
  fcmToken?: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.trim() },
  });

  // Generic error (prevents user enumeration)
  if (!user || !user.password) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  // Check verification BEFORE password compare
  if (user.status === "PENDING" && !user.isVerified) {
    OTPFn(user.email);
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Please verify your email before logging in"
    );
  }

  const isMatch = await compare(payload.password, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  // Update FCM token
  if (payload.fcmToken) {
    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: payload.fcmToken },
    });
  }

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
  const { message } = await OTPVerify({ ...payload, time: "1h" });

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
  const { accessToken } = await OTPVerify({ ...payload, time: "1h" });

  return accessToken;
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
      { expiresIn: "24h" }
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
      { expiresIn: "24h" }
    );
    return {
      ...result,
      accessToken,
    };
  }
};

const resetPassword = async (payload: { token: string; password: string }) => {
  const { email, exp } = jwtHelpers.tokenDecoder(payload.token) as JwtPayload;

  if (exp && exp < Date.now() / 1000) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Token expired");
  }

  const findUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!findUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const comparePassword = await compare(payload.password, findUser.password);
  if (comparePassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password should be different from old password"
    );
  }

  const hashedPassword = await hash(payload.password, 10);
  const result = await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return result;
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
