import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TAddReview } from "./review.interface";
import { OrderStatus } from "@prisma/client";

// ! give review
const createReview = async (payload: TAddReview, userId: string) => {
  const orderItemData = await prisma.orderItem.findFirst({
    where: {
      productId: payload?.productId,
      isReviewed: false,
      order: {
        customerId: userId,
        status: OrderStatus.COMPLETED,
      },
    },
  });

  if (!orderItemData) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid order item or product. !!"
    );
  }

  // Check if a review already exists for this order item
  const existingReview = await prisma.review.findUnique({
    where: { orderItemId: orderItemData?.id },
  });

  if (existingReview) {
    throw new AppError(httpStatus.BAD_REQUEST, "Already given review !!");
  }

  const result = prisma.$transaction(async (trnxClient) => {
    const review = await trnxClient.review.create({
      data: {
        orderItemId: orderItemData?.id,
        productId: payload?.productId,
        userId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    await trnxClient.orderItem.update({
      where: {
        id: orderItemData?.id,
        productId: payload?.productId,
      },
      data: {
        isReviewed: true,
      },
    });

    return review;
  });

  return result;

  //
};

// ! check eligibility for giving review
const checkEligibleFroReview = async (prodId: string, userId: string) => {
  const result = await prisma.orderItem.findFirst({
    where: {
      productId: prodId,
      isReviewed: false,
      order: {
        customerId: userId,
        status: OrderStatus.COMPLETED,
      },
    },
  });

  console.log("check eligible product = ", result);

  return result;
};

// ! get vendor shops product review
const getVendorProductReviews = async (vendorUserId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { vendorId: vendorUserId },
  });

  if (!shop) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Shop not found for this vendor."
    );
  }

  const reviews = await prisma.review.findMany({
    where: {
      product: {
        shopId: shop?.id,
      },
    },
    include: {
      product: true,
      user: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return reviews;

  //
};

// ! get all review
const getAllReview = async () => {
  const result = await prisma.review.findMany({
    where: { isDeleted: false },
    include: {
      product: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

// ! update review
const updateReview = async (payload: { reviewId: string; comment: string }) => {
  const { reviewId, comment } = payload;

  console.log(payload);

  const reviewData = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!reviewData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Review dont exist !!!");
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: { comment },
  });

  return result;
};

//
export const reviewServices = {
  createReview,
  checkEligibleFroReview,
  getVendorProductReviews,
  getAllReview,
  updateReview,
};
