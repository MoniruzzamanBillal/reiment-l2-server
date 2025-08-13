import { UserRole } from "@prisma/client";
import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { adminController } from "./admin.controller";

const router = Router();

// ! for getting admin statistics
router.get(
  "/stats",
  validateUser(UserRole.ADMIN),
  adminController.getAdminStatistics
);

// ! delete a user
router.patch(
  "/delete-user/:id",
  validateUser(UserRole.ADMIN),
  adminController.deleteUser
);

// ! block a user
router.patch(
  "/block-user/:id",
  validateUser(UserRole.ADMIN),
  adminController.blockUser
);
// ! block shop
router.patch(
  "/block-shop/:id",
  validateUser(UserRole.ADMIN),
  adminController.blockShop
);

//
export const adminRouter = router;
