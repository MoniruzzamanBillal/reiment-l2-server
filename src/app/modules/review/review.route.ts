import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { reviewController } from "./review.controller";

const router = Router();

// ! for getting all review
router.get("/all-review", reviewController.getAllReview);

// ! for checking eligibility for review
router.get(
  "/check-eligible-for-review/:id",
  validateUser(UserRole.CUSTOMER),
  reviewController.checkEligibleForReview
);

// ! for getting vendor prosuct review
router.get(
  "/getVendorProductReviews",
  validateUser(UserRole.VENDOR),
  reviewController.getVendorProductReviews
);

// ! add review
router.post(
  "/give-review",
  validateUser(UserRole.CUSTOMER),
  reviewController.addReview
);

// ! updating review
router.patch("/update-review", reviewController.updateReview);

//
export const reviewRouter = router;
