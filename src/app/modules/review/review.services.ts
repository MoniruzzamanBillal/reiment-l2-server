import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TAddReview } from "./review.interface";

// ! give review
const createReview = async (payload: TAddReview, userId: string) => {
  const orderItemData = await prisma.orderItem.findFirst({
    where: {
      productId: payload?.productId,
      isReviewed: false,
      order: {
        customerId: userId,
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

//
export const reviewServices = {
  createReview,
};
