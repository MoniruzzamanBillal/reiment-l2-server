import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { adminService } from "./admin.service";

// ! for getting admin statistics
const getAdminStatistics = catchAsync(async (req, res) => {
  const result = await adminService.getAdminStatistics();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Stats retrived successgully",
    data: result,
  });
});

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

// ! for blocking shop
const blockShop = catchAsync(async (req, res) => {
  await adminService.blockVendorShop(req.params.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Shop blocked successfully!!!",
  });
});

//
export const adminController = {
  deleteUser,
  blockUser,
  blockShop,
  getAdminStatistics,
};
