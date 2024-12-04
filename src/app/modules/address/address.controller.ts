import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { addressService } from "./address.service";

// ! add address
const addAddress = catchAsync(async (req, res) => {
  const result = await addressService.addAddress(req.body, req.user?.userId);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Address added successfully!!!",
    data: result,
  });
});

// ! get user address
const getUserAddress = catchAsync(async (req, res) => {
  const result = await addressService.getUserAddress(req.user?.userId);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Address retrived successfully!!!",
    data: result,
  });
});

// ! update  user address
const updateUserAddress = catchAsync(async (req, res) => {
  const result = await addressService.updateAddress(
    req.body,
    req.params.id,
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Address updated successfully!!!",
    data: result,
  });
});

// ! update  user address
const deleteUserAddress = catchAsync(async (req, res) => {
  const result = await addressService.deleteAddress(
    req.params.id,
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Address deleted successfully!!!",
    data: result,
  });
});

//
export const addressController = {
  addAddress,
  getUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
