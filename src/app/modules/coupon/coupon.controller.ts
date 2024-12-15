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

// ! for getting all coupon
const getAllCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.getAllCoupon();

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Coupon retrived successfully!!!",
    data: result,
  });
});

// ! for getting single coupon
const getSingleCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.getSingleCoupon(req.body?.coupon);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Coupon retrived successfully!!!",
    data: result,
  });
});

// ! for deleting coupon code
const deleteCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.handleDeleteCoupon(req.params?.id);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Coupon deleted successfully!!!",
    data: result,
  });
});

//
export const couponController = {
  addCoupon,
  getSingleCoupon,
  deleteCoupon,
  getAllCoupon,
};
