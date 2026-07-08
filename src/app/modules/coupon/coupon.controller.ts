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
    status: httpStatus.OK,
    success: true,
    message: "Coupon retrived successfully!!!",
    data: result,
  });
});

// ! for getting single coupon by id (admin update-page prefill)
const getSingleCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.getSingleCouponById(req.params?.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Coupon retrived successfully!!!",
    data: result,
  });
});

// ! for updating coupon
const updateCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.updateCoupon(req.params?.id, req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Coupon updated successfully!!!",
    data: result,
  });
});

// ! for previewing/applying coupon at checkout
const previewApplyCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.previewApplyCoupon(
    req.body?.code,
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Coupon applied successfully!!!",
    data: result,
  });
});

// ! for deleting coupon code
const deleteCoupon = catchAsync(async (req, res) => {
  const result = await couponServices.handleDeleteCoupon(req.params?.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Coupon deleted successfully!!!",
    data: result,
  });
});

//
export const couponController = {
  addCoupon,
  getAllCoupon,
  getSingleCoupon,
  updateCoupon,
  previewApplyCoupon,
  deleteCoupon,
};
