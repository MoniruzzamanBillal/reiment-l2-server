"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
// ! cancel payment
router.post("/cancel-payment", payment_controller_1.paymentController.cancelPayment);
// ! for successfully payment
router.post("/success", payment_controller_1.paymentController.successfullyPayment);
// router.post("/fail", paymentController.failPayment);
router.post("/cancel", (req, res) => {
    console.log("Payment Canceled:", req.body);
    res.json({ message: "Payment Canceled", data: req.body });
});
//
exports.paymentRouter = router;
