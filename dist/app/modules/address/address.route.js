"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressRouter = void 0;
const express_1 = require("express");
const address_controller_1 = require("./address.controller");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ! for getting user address
router.get("/user-address", (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR), address_controller_1.addressController.getUserAddress);
// ! for adding address
router.post("/add-address", (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR), address_controller_1.addressController.addAddress);
// ! for updating address
router.patch("/update-address/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR), address_controller_1.addressController.updateUserAddress);
// ! for updating address
router.patch("/delete-address/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR), address_controller_1.addressController.deleteUserAddress);
//
exports.addressRouter = router;
