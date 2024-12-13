import { Router } from "express";
import { couponController } from "./coupon.controller";

const router = Router();

// ! for creating coupon
router.post("/add-coupon", couponController.addCoupon);

//
export const couponRouter = router;
