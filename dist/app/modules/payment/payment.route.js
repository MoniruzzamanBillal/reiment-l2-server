"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
// ! verifying payment
router.post("/confirmation", payment_controller_1.paymentController.verifyPayment);
// ! cancel payment
router.post("/cancel-payment", payment_controller_1.paymentController.cancelPayment);
//
exports.paymentRouter = router;
