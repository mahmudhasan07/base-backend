"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const zod_1 = require("zod");
exports.authValidation = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Use valid email" }),
    password: zod_1.z.string()
});
