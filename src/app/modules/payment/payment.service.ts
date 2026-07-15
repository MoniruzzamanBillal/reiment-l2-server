import { OrderStatus } from "@prisma/client";
import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import pusherServer from "../../util/pusher";

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

  // fire-and-forget: notify the customer their order status changed.
  // never let a Pusher failure affect the already-committed payment callback.
  try {
    await pusherServer.trigger(
      `private-customer-${result.customerId}`,
      "order-status-changed",
      {
        orderId: result.id,
        trxnNumber: result.trxnNumber,
        status: result.status,
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Pusher order-status-changed trigger failed:", error);
  }

  return result;

  //
};

//
export const paymentServices = {
  successfullyPayment,
};
