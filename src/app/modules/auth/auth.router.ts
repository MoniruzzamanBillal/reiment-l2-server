import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import { upload } from "../../util/SendImageCloudinary";
import validateRequest from "../../middleware/validateRequest";
import { userValidations } from "../user/user.validation";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";

const router = Router();

// ! for login
router.post(
  "/log-in",
  validateRequest(userValidations.loginValidationSchema),
  authController.signIn
);

// ! for crating a user
router.post(
  "/create-user",
  upload.single("profileImg"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(userValidations.createUserValidationSchema),
  authController.crateUser
);

// ! for updating a user
router.patch(
  "/update-user",
  upload.single("profileImg"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateUser(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  authController.updateUser
);

// ! for deleting a user
router.patch(
  "/delete-user",
  validateUser(UserRole.ADMIN),
  authController.deleteUser
);

// ! for unblocking a user
router.patch(
  "/unblock-user",
  validateUser(UserRole.ADMIN),
  authController.unblockUser
);

//
export const authRouter = router;
