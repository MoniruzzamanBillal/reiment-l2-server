import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { userServices } from "./user.service";

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userServices.getAllUsers();

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "User Retrived successfully!!!",
    data: result,
  });
});

// ! get logged in user
const getLoggedInUser = catchAsync(async (req, res) => {
  const result = await userServices.getLoggedInUser(req.user?.userId);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "User Retrived successfully!!!",
    data: result,
  });
});

//
export const userController = { getAllUsers, getLoggedInUser };
