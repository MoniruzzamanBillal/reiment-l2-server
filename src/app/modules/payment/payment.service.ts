import { OrderStatus } from "@prisma/client";
import prisma from "../../util/prisma";
import { verifyPay } from "./payment.util";

const verifyPayment = async (transactionId: string) => {
  const verifyResult = await verifyPay(transactionId);

  if (verifyResult && verifyResult?.pay_status === "Successful") {
    await prisma.order.update({
      where: {
        trxnNumber: transactionId,
      },
      data: {
        status: OrderStatus.COMPLETED,
      },
    });
  }

  return verifyResult;
};

//
export const paymentServices = {
  verifyPayment,
};
