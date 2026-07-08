import { UserRole } from "@prisma/client";
import { Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import validateUser from "../../middleware/validateUser";
import { couponController } from "./coupon.controller";
import { couponValidations } from "./coupon.validation";

const router = Router();

// ! for getting all coupon
router.get(
  "/all-coupon",
  validateUser(UserRole.ADMIN),
  couponController.getAllCoupon
);

// ! for creating coupon
router.post(
  "/add-coupon",
  validateUser(UserRole.ADMIN),
  validateRequest(couponValidations.addCouponValidationSchema),
  couponController.addCoupon
);

// ! for getting single coupon by id (admin update-page prefill)
router.get(
  "/get-coupon/:id",
  validateUser(UserRole.ADMIN),
  couponController.getSingleCoupon
);

// ! for updating coupon
router.patch(
  "/update-coupon/:id",
  validateUser(UserRole.ADMIN),
  validateRequest(couponValidations.updateCouponValidationSchema),
  couponController.updateCoupon
);

// ! for deleting coupon
router.patch(
  "/delete-coupon/:id",
  validateUser(UserRole.ADMIN),
  couponController.deleteCoupon
);

// ! for previewing/applying coupon at checkout
router.post(
  "/apply-coupon",
  validateUser(UserRole.CUSTOMER),
  validateRequest(couponValidations.applyCouponValidationSchema),
  couponController.previewApplyCoupon
);

//
export const couponRouter = router;
