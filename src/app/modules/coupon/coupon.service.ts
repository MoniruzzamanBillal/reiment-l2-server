import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TCoupon } from "./coupon.interface";

// ! for adding coupon
const addCoupon = async (payload: TCoupon) => {
  const checkExist = await prisma.coupon.findFirst({
    where: {
      code: {
        contains: payload?.code,
        mode: "insensitive",
      },
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

// ! for getting all coupon
const getAllCoupon = async () => {
  const result = await prisma.coupon.findMany();
  return result;
};

const getSingleCoupon = async (couponCode: string) => {
  console.log("coupon code = ", couponCode);
  const checkCoupon = await prisma.coupon.findFirst({
    where: {
      code: {
        contains: couponCode,
        mode: "insensitive",
      },
    },
  });

  if (!checkCoupon) {
    throw new AppError(httpStatus.BAD_REQUEST, "This coupon don't exist!!!");
  }

  return checkCoupon;
};

// ! delete coupon
const handleDeleteCoupon = async (couponId: string) => {
  await prisma.coupon.delete({ where: { id: couponId } });
};

//
export const couponServices = {
  addCoupon,
  getSingleCoupon,
  handleDeleteCoupon,
  getAllCoupon,
};
