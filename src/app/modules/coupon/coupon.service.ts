import { Coupon } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TCoupon, TCouponUpdate } from "./coupon.interface";

// ! shared date-range check, reused by order.service.ts at commit time
export const assertCouponDatesValid = (coupon: Coupon) => {
  const now = new Date();

  if (now < coupon.startDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This coupon is not active yet. It becomes valid on ${coupon.startDate.toDateString()}.`
    );
  }

  if (now > coupon.endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This coupon expired on ${coupon.endDate.toDateString()}.`
    );
  }
};

// ! for adding coupon
const addCoupon = async (payload: TCoupon) => {
  const checkExist = await prisma.coupon.findFirst({
    where: {
      code: {
        equals: payload?.code,
        mode: "insensitive",
      },
      isDeleted: false,
    },
  });

  if (checkExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "This coupon already exist!!!");
  }

  const result = await prisma.coupon.create({
    data: {
      ...payload,
      // validateRequest's zod coercion doesn't write back to req.body, so
      // startDate/endDate still arrive as raw date-only strings here
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    },
  });

  return result;
};

// ! for getting all coupon
const getAllCoupon = async () => {
  const result = await prisma.coupon.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

// ! for getting single coupon by id (admin update-page prefill)
const getSingleCouponById = async (couponId: string) => {
  const result = await prisma.coupon.findFirst({
    where: { id: couponId, isDeleted: false },
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon not found.");
  }

  return result;
};

// ! for updating coupon
const updateCoupon = async (couponId: string, payload: TCouponUpdate) => {
  const couponData = await prisma.coupon.findFirst({
    where: { id: couponId, isDeleted: false },
  });

  if (!couponData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon not found.");
  }

  const result = await prisma.coupon.update({
    where: { id: couponId },
    data: {
      ...payload,
      ...(payload.startDate && { startDate: new Date(payload.startDate) }),
      ...(payload.endDate && { endDate: new Date(payload.endDate) }),
    },
  });

  return result;
};

// ! delete coupon (soft delete)
const handleDeleteCoupon = async (couponId: string) => {
  const couponData = await prisma.coupon.findFirst({
    where: { id: couponId, isDeleted: false },
  });

  if (!couponData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Coupon not found.");
  }

  const result = await prisma.coupon.update({
    where: { id: couponId },
    data: { isDeleted: true },
  });

  return result;
};

// ! read-only validity check: existence, date range, usage limit
const validateCouponForUse = async (code: string) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      isDeleted: false,
    },
  });

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon code not found.");
  }

  assertCouponDatesValid(coupon);

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This coupon has reached its maximum usage limit and can no longer be used."
    );
  }

  return coupon;
};

// ! read-only check: has this user already used this coupon
const checkUserCouponEligibility = async (couponId: string, userId: string) => {
  const existingUsage = await prisma.couponUsage.findUnique({
    where: {
      couponId_userId: {
        couponId,
        userId,
      },
    },
  });

  if (existingUsage) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already used this coupon."
    );
  }
};

// ! checkout "preview apply" — read-only, no mutation
const previewApplyCoupon = async (code: string, userId: string) => {
  const coupon = await validateCouponForUse(code);
  await checkUserCouponEligibility(coupon.id, userId);

  return coupon;
};

//
export const couponServices = {
  addCoupon,
  updateCoupon,
  getAllCoupon,
  getSingleCouponById,
  handleDeleteCoupon,
  previewApplyCoupon,
  validateCouponForUse,
  checkUserCouponEligibility,
};
