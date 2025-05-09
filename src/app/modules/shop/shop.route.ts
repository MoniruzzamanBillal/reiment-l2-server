import { NextFunction, Request, Response, Router } from "express";
import { shopController } from "./shop.controller";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { upload } from "../../util/SendImageCloudinary";

const router = Router();

// ! for getting all shop data
router.get(
  "/all-shop-data",
  validateUser(UserRole.ADMIN),
  shopController.getAllShopData
);

// ! for getting vendor shop data
router.get(
  "/vendor-shop",
  validateUser(UserRole.VENDOR),
  shopController.getVendorShop
);

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

// ! for getting single shop data
router.get("/shop-detail/:id", shopController.getSingleShop);

// ! for updating a shop
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
