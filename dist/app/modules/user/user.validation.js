"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const createValidation = zod_1.z.object({
    name: zod_1.z.string().min(2).max(255),
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long")
    // .regex(/[a-zA-Z0-9]/, "Password must contain only letters and numbers")
});
const updateValidation = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Invalid email").optional(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long").optional()
});
const changePasswordValidation = zod_1.z.object({
    oldPassword: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
    newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters long")
});
exports.UserValidation = { createValidation, updateValidation, changePasswordValidation };
