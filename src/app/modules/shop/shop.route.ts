import { NextFunction, Request, Response, Router } from "express";
import { shopController } from "./shop.controller";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { upload } from "../../util/SendImageCloudinary";

const router = Router();

// ! for crating a shop
router.post(
  "/create-shop",
  upload.single("logo"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateUser(UserRole.VENDOR),
  shopController.crateShop
);

// ! for crating a shop
router.patch(
  "/update-shop/:id",
  upload.single("logo"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateUser(UserRole.VENDOR),
  shopController.updateShopData
);

//
export const shopRouter = router;
