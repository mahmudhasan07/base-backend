import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { userController } from "./user.controller";
import { UserValidation } from "./user.validation";

const route = Router()

route.post('/create', validateRequest(UserValidation), userController.createUserController)
// route.post("/verifyOTP", userController.OTPVerifyController)
route.patch('/change-password', userController.passwordChangeController)


export const userRoutes = route