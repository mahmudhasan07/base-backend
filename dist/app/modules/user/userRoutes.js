"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const userValidation_1 = require("./userValidation");
const userController_1 = require("./userController");
const auth_1 = __importDefault(require("../../middleware/auth"));
const client_1 = require("@prisma/client");
const route = (0, express_1.Router)();
route.post('/create', (0, validateRequest_1.default)(userValidation_1.UserValidation), userController_1.userController.createUserController);
route.put('/update', (0, auth_1.default)(client_1.Role.USER), userController_1.userController.updateUserController);
exports.userRoutes = route;
