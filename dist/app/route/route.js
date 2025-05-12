"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = require("../modules/user/user.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
// import { foodRoutes } from "../modules/foods/foods.Routes"
// import { locationRoutes } from "../modules/location/location.Routes"
const router = (0, express_1.Router)();
const routes = [
    {
        path: "/user",
        component: user_routes_1.userRoutes
    },
    {
        path: "/auth",
        component: auth_routes_1.authRoutes
    },
];
routes.forEach(route => router.use(route.path, route.component));
exports.default = router;
