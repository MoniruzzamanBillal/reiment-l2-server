import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { authServices } from "./auth.service";

// ! for crating a user
const crateUser = catchAsync(async (req, res) => {
  const result = await authServices.createUser(req.body, req.file);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User created successfully!!!",
    data: result,
  });
});

// ! for login
const signIn = catchAsync(async (req, res) => {
  const result = await authServices.login(req.body);

  const { userData, token } = result;
  const modifiedToken = `Bearer ${token}`;

  res.cookie("token", modifiedToken, {
    secure: false,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User logged in successfully!!!",
    data: userData,
    token: token,
  });
});

//
export const authController = {
  crateUser,
  signIn,
};
