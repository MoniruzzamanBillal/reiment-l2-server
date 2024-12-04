import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { orderController } from "./order.controller";

const router = Router();

// ! for getting user order
router.get(
  "/user-order-history",
  validateUser(UserRole.CUSTOMER),
  orderController.getUserOrder
);

// ! for ordering item
router.post(
  "/order-item",
  validateUser(UserRole.CUSTOMER),
  orderController.orderItem
);

//
export const orderRouter = router;
