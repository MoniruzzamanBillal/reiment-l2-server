import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { reviewController } from "./review.controller";

const router = Router();

// ! add review
router.post(
  "/give-review",
  validateUser(UserRole.CUSTOMER),
  reviewController.addReview
);

//
export const reviewRouter = router;
