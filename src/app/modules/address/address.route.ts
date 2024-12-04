import { Router } from "express";
import { addressController } from "./address.controller";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";

const router = Router();

// ! for getting user address

router.get(
  "/user-address",
  validateUser(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  addressController.getUserAddress
);

// ! for adding address
router.post(
  "/add-address",
  validateUser(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  addressController.addAddress
);

// ! for updating address
router.patch(
  "/update-address/:id",
  validateUser(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  addressController.updateUserAddress
);

// ! for updating address
router.patch(
  "/delete-address/:id",
  validateUser(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  addressController.deleteUserAddress
);

//
export const addressRouter = router;
