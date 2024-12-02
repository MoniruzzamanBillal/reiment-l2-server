import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { adminService } from "./admin.service";

// ! for deleting user
const deleteUser = catchAsync(async (req, res) => {
  await adminService.deleteUser(req.params.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User deleted successfully!!!",
  });
});

// ! for blocking a user
const blockUser = catchAsync(async (req, res) => {
  await adminService.blockUser(req.params.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User blocked successfully!!!",
  });
});

//
export const adminController = {
  deleteUser,
  blockUser,
};
