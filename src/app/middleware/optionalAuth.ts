import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { jwtHelpers } from "../helper/jwtHelper";

const optionalAuth = () => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      // If no token -> continue as guest
      if (!token || !token.startsWith("Bearer ")) {
        req.user = null;
        return next();
      }

      const accessToken = token.split("Bearer ")[1];

      try {
        const verifiedUser = jwtHelpers.verifyToken(accessToken) as JwtPayload;
        req.user = verifiedUser; // attach user
      } catch (err) {
        // Invalid token → treat as guest
        req.user = null;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default optionalAuth;
