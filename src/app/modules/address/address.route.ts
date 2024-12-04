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

//
export const addressRouter = router;
