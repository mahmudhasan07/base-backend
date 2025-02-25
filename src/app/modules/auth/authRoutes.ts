import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { authValidation } from "./authValidation";
import { authController } from "./authController";

const route = Router()

route.post("/login", validateRequest(authValidation), authController.logInUserController)
route.post('/forget-password', authController.forgetPasswordController)

export const authRoutes = route