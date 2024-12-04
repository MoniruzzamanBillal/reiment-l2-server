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

//
export const addressController = {
  addAddress,
};
