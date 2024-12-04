import catchAsync from "../../util/catchAsync";
import { paymentServices } from "./payment.service";

const redirectURL = "http://localhost:3000";

// ! for verify payment
const verifyPayment = catchAsync(async (req, res) => {
  const { transactionId, userId } = req.query;

  const result = await paymentServices.verifyPayment(transactionId as string);

  if (!result) {
    throw new Error("Payment unsuccessful");
  }

  if (result) {
    return res.redirect(`${redirectURL}/payment-confirm/${userId}`);
  } else {
    throw new Error("Payment unsuccessfull");
  }
});

// ! for cancel payment
const cancelPayment = catchAsync(async (req, res) => {
  return res.redirect(`${redirectURL}`);
});

//
export const paymentController = { cancelPayment, verifyPayment };
