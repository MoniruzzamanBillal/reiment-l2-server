import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { reviewServices } from "./review.services";

// ! for giving review
const addReview = catchAsync(async (req, res) => {
  const result = await reviewServices.createReview(req.body, req.user?.userId);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Review added successfully!!!",
    data: result,
  });
});

// ! for checking eligibility for order
const checkEligibleForReview = catchAsync(async (req, res) => {
  const result = await reviewServices.checkEligibleFroReview(
    req.params?.id,
    req.user?.userId
  );

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Eligible for review!!!",
    data: result,
  });
});

// ! get vendor shops product review
const getVendorProductReviews = catchAsync(async (req, res) => {
  const result = await reviewServices.getVendorProductReviews(req.user?.userId);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Vendor shops product review ",
    data: result,
  });
});

// ! for getting all reviews
const getAllReview = catchAsync(async (req, res) => {
  const result = await reviewServices.getAllReview();

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Review retrived successfully !!! ",
    data: result,
  });
});

// ! for updating review
const updateReview = catchAsync(async (req, res) => {
  const result = await reviewServices.updateReview(req.body);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Review updated successfully !!! ",
    data: result,
  });
});

//
export const reviewController = {
  addReview,
  checkEligibleForReview,
  getVendorProductReviews,
  getAllReview,
  updateReview,
};
