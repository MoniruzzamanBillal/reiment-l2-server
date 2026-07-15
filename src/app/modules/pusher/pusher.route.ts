import { UserRole } from "@prisma/client";
import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { pusherController } from "./pusher.controller";

const router = Router();

// ! for authorizing private channel subscriptions (any authenticated user)
router.post(
  "/auth",
  validateUser(UserRole.ADMIN, UserRole.VENDOR, UserRole.CUSTOMER),
  pusherController.authorizeChannel,
);

//
export const pusherRouter = router;
