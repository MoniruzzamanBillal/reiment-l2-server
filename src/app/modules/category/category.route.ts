import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middleware/validateRequest";
import { categoryValidations } from "./category.validations";
import { categoryController } from "./category.controller";

const router = Router();

// ! for getting all category
router.get("/all-category", categoryController.getAllCategory);

// ! for creating a category
router.post(
  "/add-category",
  validateUser(UserRole.ADMIN),
  validateRequest(categoryValidations.createCategotyValidationSchema),
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
