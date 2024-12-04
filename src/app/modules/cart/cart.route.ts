import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { cartController } from "./cart.controller";

const router = Router();

// ! for getting cart data
router.get(
  "/my-cart",
  validateUser(UserRole.CUSTOMER),
  cartController.getCartData
);

// ! for adding in cart
router.post(
  "/add-to-cart",
  validateUser(UserRole.CUSTOMER),
  cartController.addToCart
);

// ! for adding in cart
router.patch(
  "/replace-cart",
  validateUser(UserRole.CUSTOMER),
  cartController.replaceCart
);

// ! for deleting a cart item
router.delete(
  "/delete-cart-item",
  validateUser(UserRole.CUSTOMER),
  cartController.deleteCartItem
);

//
export const cartRouter = router;
