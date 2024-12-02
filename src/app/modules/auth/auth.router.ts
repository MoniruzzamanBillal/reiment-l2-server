import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import { upload } from "../../util/SendImageCloudinary";
import validateRequest from "../../middleware/validateRequest";
import { userValidations } from "../user/user.validation";

const router = Router();

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

//
export const authRouter = router;
