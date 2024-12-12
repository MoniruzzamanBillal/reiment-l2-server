import { NextFunction, Request, Response, Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middleware/validateRequest";
import { categoryValidations } from "./category.validations";
import { categoryController } from "./category.controller";
import { upload } from "../../util/SendImageCloudinary";

const router = Router();

// ! for getting all category
router.get("/all-category", categoryController.getAllCategory);

// ! for creating a category
router.post(
  "/add-category",
  upload.single("categoryImg"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateUser(UserRole.ADMIN),
  // validateRequest(categoryValidations.createCategotyValidationSchema),
  categoryController.createCategory
);

// ! for getting single category
router.get("/category/:id", categoryController.getSingleCategory);

// ! for updating category
router.patch(
  "/update-category/:id",
  validateUser(UserRole.ADMIN),
  validateRequest(categoryValidations.updateCategotyValidationSchema),
  categoryController.updateCategory
);

// ! for deleting category
router.patch(
  "/delete-category/:id",
  validateUser(UserRole.ADMIN),
  categoryController.deleteCategory
);

//
export const categoryRouter = router;
