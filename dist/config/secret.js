"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt_secret = exports.prot = void 0;
require("dotenv/config");
exports.prot = process.env.PORT;
exports.jwt_secret = process.env.TOKEN_SECRET;
