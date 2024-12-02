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

//
export const authController = {
  crateUser,
};
