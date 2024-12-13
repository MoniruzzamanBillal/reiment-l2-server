import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TCoupon } from "./coupon.interface";

// ! for adding coupon
const addCoupon = async (payload: TCoupon) => {
  const checkExist = await prisma.coupon.findUnique({
    where: {
      code: payload?.code,
    },
  });

  if (checkExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "This coupon already exist!!!");
  }

  const result = await prisma.coupon.create({
    data: payload,
  });

  return result;
};

//
export const couponServices = {
  addCoupon,
};
