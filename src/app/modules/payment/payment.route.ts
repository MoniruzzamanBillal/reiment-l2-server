import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();

// ! cancel payment
router.post("/cancel-payment", paymentController.cancelPayment);

// ! for successfully payment
router.post("/success", paymentController.successfullyPayment);
// router.post("/fail", paymentController.failPayment);

router.post("/cancel", (req, res) => {
  console.log("Payment Canceled:", req.body);
  res.json({ message: "Payment Canceled", data: req.body });
});

//
export const paymentRouter = router;
