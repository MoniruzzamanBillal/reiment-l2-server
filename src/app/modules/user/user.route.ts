import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { userController } from "./user.controller";

const router = Router();

// ! for getting all user
router.get(
  "/all-user",
  validateUser(UserRole.ADMIN),
  userController.getAllUsers
);

// ! for getting logged in user
router.get(
  "/logged-user",
  validateUser(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  userController.getLoggedInUser
);

//
export const userRouter = router;
