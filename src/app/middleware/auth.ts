import { NextFunction, Request, Response } from "express";
import { JwtPayload, Secret } from "jsonwebtoken";
import ApiError from "../error/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../helper/jwtHelper";


const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.tokenVerifier(token) as JwtPayload

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Forbidden, You are not authorized!"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
