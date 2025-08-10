import { UserRole } from "@prisma/client";
import { Router } from "express";
import validateUser from "../../middleware/validateUser";
import { orderController } from "./order.controller";

const router = Router();

// ! for getting all transaction data
router.get("/all-transaction", orderController.getAllOrderTransactionData);

// ! for getting user order
router.get(
  "/user-order-history",
  validateUser(UserRole.CUSTOMER),
  orderController.getUserOrder
);

// ! for getting vendor shop order
router.get(
  "/vendorShop-order-history",
  validateUser(UserRole.VENDOR),
  orderController.getVendorOrderHistory
);

// ! for ordering item
router.post(
  "/order-item",
  validateUser(UserRole.CUSTOMER),
  orderController.orderItem
);

//
export const orderRouter = router;
