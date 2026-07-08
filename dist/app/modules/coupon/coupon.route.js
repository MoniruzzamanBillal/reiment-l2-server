"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const coupon_controller_1 = require("./coupon.controller");
const coupon_validation_1 = require("./coupon.validation");
const router = (0, express_1.Router)();
// ! for getting all coupon
router.get("/all-coupon", (0, validateUser_1.default)(client_1.UserRole.ADMIN), coupon_controller_1.couponController.getAllCoupon);
// ! for creating coupon
router.post("/add-coupon", (0, validateUser_1.default)(client_1.UserRole.ADMIN), (0, validateRequest_1.default)(coupon_validation_1.couponValidations.addCouponValidationSchema), coupon_controller_1.couponController.addCoupon);
// ! for getting single coupon by id (admin update-page prefill)
router.get("/get-coupon/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN), coupon_controller_1.couponController.getSingleCoupon);
// ! for updating coupon
router.patch("/update-coupon/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN), (0, validateRequest_1.default)(coupon_validation_1.couponValidations.updateCouponValidationSchema), coupon_controller_1.couponController.updateCoupon);
// ! for deleting coupon
router.patch("/delete-coupon/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN), coupon_controller_1.couponController.deleteCoupon);
// ! for previewing/applying coupon at checkout
router.post("/apply-coupon", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), (0, validateRequest_1.default)(coupon_validation_1.couponValidations.applyCouponValidationSchema), coupon_controller_1.couponController.previewApplyCoupon);
//
exports.couponRouter = router;
