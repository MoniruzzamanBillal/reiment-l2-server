import { NextFunction, Request, Response, Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { productController } from "./product.controller";
import { upload } from "../../util/SendImageCloudinary";
import validateRequest from "../../middleware/validateRequest";
import { productValidations } from "./product.validation";

const router = Router();

// ! for adding product
router.post(
  "/add-product",
  upload.single("prodImg"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateUser(UserRole.VENDOR),
  validateRequest(productValidations.addProductValidationSchema),
  productController.addProduct
);

//
export const productRouter = router;
