import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
// import { userServices } from "../user/userService";
import sendResponse from "../../middleware/sendResponse";
import { StatusCodes } from "http-status-codes";
import { authService } from "./auth.service";
import { decode } from "jsonwebtoken";

const logInUserController = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.logInFromDB(req.body);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "User login successfully", data: result })
})


const verifyOtp = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as any
    const token = req.headers.authorization as string

    const {email} = decode(token) as any

    const payload = {...body,email}
    const result = await authService.verifyOtp(payload);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "OTP verified successfully", data: result })

})

const forgetPasswordController = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.forgetPassword(req.body);
    sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: "OTP sent to your email", data: result })
})


export const authController = { logInUserController, forgetPasswordController, verifyOtp }