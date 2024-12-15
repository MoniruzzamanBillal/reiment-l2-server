"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponRouter = void 0;
const express_1 = require("express");
const coupon_controller_1 = require("./coupon.controller");
const router = (0, express_1.Router)();
// ! for creating coupon
router.post("/add-coupon", coupon_controller_1.couponController.addCoupon);
// ! for getting single coupon
router.post("/get-coupon", coupon_controller_1.couponController.getSingleCoupon);
//
exports.couponRouter = router;
