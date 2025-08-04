import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import validateRequest from "../../middleware/validateRequest";
import validateUser from "../../middleware/validateUser";
import { upload } from "../../util/SendImageCloudinary";
import { productController } from "./product.controller";
import { productValidations } from "./product.validation";

const router = Router();

// ! for getting all product
router.get("/all-products", productController.getAllProducts);

// ! for getting flash sale  products
router.get("/flashsale-products", productController.getFlashSaleProduct);

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

// ! for duplicating a product
router.post(
  "/duplicate-product",
  validateUser(UserRole.VENDOR),
  productController.duplicateProduct
);

// ! for getting recent products
router.patch("/recent-products", productController.getRecentProducts);

// ! for getting vendor shop's product
router.get("/get-vendor-product/:id", productController.getVendorShopProducts);

// ! for getting vendor shop's product
router.get("/get-related-products/:id", productController.getRelatedProducts);

// ! for getting single product
router.get("/get-product/:id", productController.getSingleProduct);

// ! for updating product
router.patch(
  "/update-product/:id",
  upload.single("prodImg"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateUser(UserRole.VENDOR),
  validateRequest(productValidations.updateProductValidationSchema),
  productController.updateProduct
);

// ! for deleting a product
router.patch(
  "/delete-product/:id",
  validateUser(UserRole.VENDOR),
  productController.deleteProduct
);

//
export const productRouter = router;
