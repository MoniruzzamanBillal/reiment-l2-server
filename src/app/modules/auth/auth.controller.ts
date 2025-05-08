import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { authServices } from "./auth.service";

// ! for crating a user
const crateUser = catchAsync(async (req, res) => {
  const result = await authServices.createUser(req.body, req.file);

  const { userData, token } = result;

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User created successfully!!!",
    data: userData,
    token: token,
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

  const { user, token } = result;
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
    data: user,
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

// ! for unblocking vendor shop
const unbBlockVendor = catchAsync(async (req, res) => {
  const result = await authServices.unblockVendor(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Vendor shop unblocked successfully!!!",
    data: result,
  });
});

// ! for changing password 1st time login
const change1stPassword = catchAsync(async (req, res) => {
  const result = await authServices.changePassword(req.body, req.user?.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "password changed successfully!!!",
    data: result,
  });
});

// !send reset link to mail
const sendResetLink = catchAsync(async (req, res) => {
  const result = await authServices.resetMailLink(req?.params?.email);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Reset email sent successfully  ",
    data: result,
  });
});

// ! for reseting password
const resetPassWord = catchAsync(async (req, res) => {
  await authServices.resetPasswordFromDb(req?.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Password reset successfully  ",
    data: { message: "success" },
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
  unbBlockVendor,
  change1stPassword,
  sendResetLink,
  resetPassWord,
};
