import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
// import { UserValidation } from "./userValidation";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { Role } from "@prisma/client";
import { UserValidation } from "./user.validation";

const route = Router()

route.post('/create', validateRequest(UserValidation), userController.createUserController)
route.post("/verifyOTP", userController.OTPVerifyController)
route.put('/update', auth(Role.USER), userController.updateUserController)


export const userRoutes = route