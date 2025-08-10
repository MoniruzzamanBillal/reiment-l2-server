import catchAsync from "../../util/catchAsync";
import { paymentServices } from "./payment.service";

// const redirectURL = "http://localhost:5173";
const redirectURL = "https://reiment-l2-client.vercel.app";

// ! for cancel payment
const cancelPayment = catchAsync(async (req, res) => {
  return res.redirect(`${redirectURL}`);
});

// ! after successfully payment
const successfullyPayment = catchAsync(async (req, res) => {
  const result = await paymentServices.successfullyPayment(req?.body);

  if (!result) {
    throw new Error("Payment unsuccessful");
  }

  if (result) {
    return res.redirect(`${redirectURL}/order-success`);
  }
});

//
export const paymentController = {
  cancelPayment,

  successfullyPayment,
};
