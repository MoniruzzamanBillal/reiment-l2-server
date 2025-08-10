import { OrderStatus } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";

// ! after successfully payment
const successfullyPayment = async (payload: any) => {
  const { tran_id, status } = payload;

  if (status !== "VALID") {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment Failed !!!");
  }

  const result = await prisma.order.update({
    where: {
      trxnNumber: tran_id,
    },
    data: {
      status: OrderStatus.COMPLETED,
    },
  });

  return result;

  //
};

//
export const paymentServices = {
  successfullyPayment,
};
