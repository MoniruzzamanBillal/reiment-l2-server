import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { couponServices } from "./coupon.service";

// ! for adding coupon
const addCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.addCoupon(req.body);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Coupon Created successfully!!!",
    data: result,
  });
});

//
export const couponController = {
  addCoupon,
};
