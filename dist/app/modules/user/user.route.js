"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// ! for getting all user
router.get("/all-user", (0, validateUser_1.default)(client_1.UserRole.ADMIN), user_controller_1.userController.getAllUsers);
// ! for getting logged in user
router.get("/logged-user", (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR), user_controller_1.userController.getLoggedInUser);
//
exports.userRouter = router;
