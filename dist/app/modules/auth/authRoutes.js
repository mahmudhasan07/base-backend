"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const authValidation_1 = require("./authValidation");
const authController_1 = require("./authController");
const route = (0, express_1.Router)();
route.post("/login", (0, validateRequest_1.default)(authValidation_1.authValidation), authController_1.authController.logInUserController);
route.post('/forget-password', authController_1.authController.forgetPasswordController);
exports.authRoutes = route;
