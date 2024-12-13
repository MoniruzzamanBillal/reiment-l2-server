import { Router } from "express";
import { followerController } from "./follower.controller";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";

const router = Router();

// ! for following a shop
router.post(
  "/follow-shop",
  validateUser(UserRole.CUSTOMER),
  followerController.followShop
);

// ! for unfollowing a shop
router.delete(
  "/unfollow-shop",
  validateUser(UserRole.CUSTOMER),
  followerController.unfollowShop
);

//
export const followerRouter = router;
