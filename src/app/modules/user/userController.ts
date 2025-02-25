import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { userServices } from "./userService";
import sendResponse from "../../middleware/sendResponse";
import { StatusCodes } from "http-status-codes";

const createUserController = catchAsync(async (req: Request, res: Response) => {
    const result = await userServices.createUserIntoDB(req.body)
    sendResponse(res, {statusCode : StatusCodes.CREATED, message: "User created successfully", data: result, success: true})
})

const updateUserController = catchAsync(async (req: Request, res: Response) => {
    const result = await userServices.updateUserFromDB(req)
    sendResponse(res, {statusCode : StatusCodes.OK, message: "User updated successfully", data: result, success: true})
})

export const userController = { createUserController, updateUserController}