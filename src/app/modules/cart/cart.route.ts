import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { cartController } from "./cart.controller";

const router = Router();

// ! for adding in cart
router.post(
  "/add-to-cart",
  validateUser(UserRole.CUSTOMER),
  cartController.addToCart
);

//
export const cartRouter = router;
