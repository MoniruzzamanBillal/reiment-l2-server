"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const cart_controller_1 = require("./cart.controller");
const router = (0, express_1.Router)();
// ! for getting cart data
router.get("/my-cart", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), cart_controller_1.cartController.getCartData);
// ! for adding in cart
router.post("/add-to-cart", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), cart_controller_1.cartController.addToCart);
// ! for increasing cart quantity
router.patch("/increase-item-quantity", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), cart_controller_1.cartController.updateCartQuantity);
// ! for decreasing cart quantity
router.patch("/decrease-item-quantity", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), cart_controller_1.cartController.decreaseCartQuantity);
// ! for replacing  cart item
router.patch("/replace-cart", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), cart_controller_1.cartController.replaceCart);
// ! for deleting a cart item
router.delete("/delete-cart-item", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), cart_controller_1.cartController.deleteCartItem);
//
exports.cartRouter = router;
