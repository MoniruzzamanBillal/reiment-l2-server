import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { UserRole } from "@prisma/client";
import { orderController } from "./order.controller";

const router = Router();

// ! for ordering item
router.post(
  "/order-item",
  validateUser(UserRole.CUSTOMER),
  orderController.orderItem
);

//
export const orderRouter = router;
