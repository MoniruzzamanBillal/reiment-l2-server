import { Router } from "express";
import { couponController } from "./coupon.controller";

const router = Router();

// ! for creating coupon
router.post("/add-coupon", couponController.addCoupon);

// ! for getting single coupon
router.post("/get-coupon", couponController.getSingleCoupon);

//
export const couponRouter = router;
