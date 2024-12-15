"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const admin_controller_1 = require("./admin.controller");
const router = (0, express_1.Router)();
// ! delete a user
router.patch("/delete-user/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN), admin_controller_1.adminController.deleteUser);
// ! block a user
router.patch("/block-user/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN), admin_controller_1.adminController.blockUser);
// ! block shop
router.patch("/block-shop/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN), admin_controller_1.adminController.blockShop);
//
exports.adminRouter = router;
