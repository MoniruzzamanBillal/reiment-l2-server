import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { adminController } from "./admin.controller";

const router = Router();

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

//
export const adminRouter = router;
