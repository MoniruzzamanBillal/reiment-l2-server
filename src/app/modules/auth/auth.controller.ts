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

// ! for updating a user
const updateUser = catchAsync(async (req, res) => {
  const result = await authServices.updateUser(
    req.body,
    req.file,
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User updated successfully!!!",
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

// ! for deleting a user
const deleteUser = catchAsync(async (req, res) => {
  const result = await authServices.deleteUser(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User deleted successfully!!!",
    data: result,
  });
});

// ! for unblocking a user
const unblockUser = catchAsync(async (req, res) => {
  const result = await authServices.unblockUser(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User unblocked successfully!!!",
    data: result,
  });
});

// ! for blocking vendor shop
const blockVendor = catchAsync(async (req, res) => {
  const result = await authServices.blockVendorShop(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Vendor shop blocked successfully!!!",
    data: result,
  });
});

//
export const authController = {
  crateUser,
  signIn,
  updateUser,
  deleteUser,
  unblockUser,
  blockVendor,
};
