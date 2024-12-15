import catchAsync from "../../util/catchAsync";
import { paymentServices } from "./payment.service";

// const redirectURL = "http://localhost:5173";
const redirectURL = "https://reiment-l2-client.vercel.app";

// ! for verify payment
const verifyPayment = catchAsync(async (req, res) => {
  const { transactionId, userId } = req.query;

  console.log(userId);

  const result = await paymentServices.verifyPayment(transactionId as string);

  if (!result) {
    throw new Error("Payment unsuccessful");
  }

  if (result) {
    return res.redirect(`${redirectURL}/order-success`);
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
