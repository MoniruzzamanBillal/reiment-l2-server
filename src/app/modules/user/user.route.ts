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

//
export const userRouter = router;
