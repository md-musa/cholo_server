import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../helper/jwtHelper";

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;
      console.log("token", token);
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
      }
      // verify token
      let verifiedUser = null;

      try {
        verifiedUser = jwtHelpers.verifyToken(token, config.JWT.ACCESS_TOKEN_SECRET as Secret);
      } catch (error) {
        // Token verification failed
        return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
      }

      req.user = verifiedUser; // role  , userid

      // role diye guard korar jnno
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Forbidden");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
