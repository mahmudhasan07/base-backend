import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";
import { authController } from "./auth.controller";

const route = Router();

route.post(
  "/login",
  validateRequest(authValidation.loginUser),
  authController.logInUserController
);
route.post(
  "/verify-otp",
  validateRequest(authValidation.verifyOtp),
  authController.verifyOtp
);
route.post(
  "/forget-password",
  validateRequest(authValidation.forgotPassword),
  authController.forgetPasswordController
);

route.post("/forget-otp-verify", authController.resetOtpVerifyController);

route.post(
  "/resend-otp",
  validateRequest(authValidation.verifyOtp),
  authController.resendOtpController
);


route.post("/reset-password", authController.resetPasswordController);

route.post("/social", authController.socialLoginController);

export const authRoutes = route;
