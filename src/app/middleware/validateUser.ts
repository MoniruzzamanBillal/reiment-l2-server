import httpStatus from "http-status";
import AppError from "../Error/AppError";

import catchAsync from "../util/catchAsync";
import Jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { UserRole } from "@prisma/client";

const validateUser = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Authorization header missing or malformed"
      );
    }

    const token = header?.split(" ")[1];

    const decoded = Jwt.verify(
      token,
      config.jwt_secret as string
    ) as JwtPayload;

    const { userRole } = decoded;

    if (requiredRoles && !requiredRoles.includes(userRole)) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "You have no access to this route",
      });
    }

    req.user = decoded;

    next();

    //
  });
};

export default validateUser;
