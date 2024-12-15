import { Router } from "express";
import { couponController } from "./coupon.controller";

const router = Router();

// ! for getting all coupon
router.get("/all-coupon", couponController.getAllCoupon);

// ! for creating coupon
router.post("/add-coupon", couponController.addCoupon);

// ! for getting single coupon
router.post("/get-coupon", couponController.getSingleCoupon);

// ! for deleting coupon
router.patch("/delete-coupon/:id", couponController.deleteCoupon);

//
export const couponRouter = router;
