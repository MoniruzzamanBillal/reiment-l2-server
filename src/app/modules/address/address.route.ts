import { Router } from "express";
import { addressController } from "./address.controller";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";

const router = Router();

// ! for adding address
router.post(
  "/add-address",
  validateUser(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR),
  addressController.addAddress
);

//
export const addressRouter = router;
