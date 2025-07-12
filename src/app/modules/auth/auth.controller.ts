import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
// import { userServices } from "../user/userService";
import sendResponse from "../../middleware/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service";
import { decode } from "jsonwebtoken";

const logInUserController = catchAsync(async (req: Request, res: Response) => {
  const body = req.body
  const result = await authService.logInFromDB(body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User login successfully",
    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as any;

  const result = await authService.verifyOtp(body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OTP verified successfully",
    data: result,
  });
});


const forgetPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body
    const result = await authService.forgetPassword(body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "OTP sent to your email",
      data: result,
    });
  }
);


const resetOtpVerifyController = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await authService.resetOtpVerify(body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OTP verified successfully",
    data: result,
  });
})


const resendOtpController = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await authService.resendOtp(body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OTP sent to your email",
    data: result,
  });
});


const socialLoginController = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const result = await authService.socialLogin(body);
  sendResponse(res, {statusCode : StatusCodes.OK, success : true, message : "User login successfully", data : result});
})

const resetPasswordController = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;

  const result = await authService.resetPassword(body);
  sendResponse(res, {statusCode : StatusCodes.OK, success : true, message : "User login successfully", data : result});
})

export const authController = {
  logInUserController,
  forgetPasswordController,
  verifyOtp,
  resendOtpController,
  socialLoginController,
  resetOtpVerifyController,
  resetPasswordController
};
