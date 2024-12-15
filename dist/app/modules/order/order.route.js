"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
// ! for getting all transaction data
router.get("/all-transaction", order_controller_1.orderController.getAllOrderTransactionData);
// ! for getting user order
router.get("/user-order-history", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), order_controller_1.orderController.getUserOrder);
// ! for getting vendor shop order
router.get("/vendorShop-order-history", (0, validateUser_1.default)(client_1.UserRole.VENDOR), order_controller_1.orderController.getVendorOrderHistory);
// ! for ordering item
router.post("/order-item", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), order_controller_1.orderController.orderItem);
//
exports.orderRouter = router;
