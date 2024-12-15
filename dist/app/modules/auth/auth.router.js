"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const user_validation_1 = require("../user/user.validation");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ! for login
router.post("/log-in", (0, validateRequest_1.default)(user_validation_1.userValidations.loginValidationSchema), auth_controller_1.authController.signIn);
// ! for crating a user
router.post("/create-user", SendImageCloudinary_1.upload.single("profileImg"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateRequest_1.default)(user_validation_1.userValidations.createUserValidationSchema), auth_controller_1.authController.crateUser);
// ! for updating a user
router.patch("/update-user", SendImageCloudinary_1.upload.single("profileImg"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR), auth_controller_1.authController.updateUser);
// ! for deleting a user
router.patch("/delete-user", (0, validateUser_1.default)(client_1.UserRole.ADMIN), auth_controller_1.authController.deleteUser);
// ! for unblocking a user
router.patch("/unblock-user", (0, validateUser_1.default)(client_1.UserRole.ADMIN), auth_controller_1.authController.unblockUser);
// ! for blocking vendor shop
router.patch("/block-vendor-shop", (0, validateUser_1.default)(client_1.UserRole.ADMIN), auth_controller_1.authController.blockVendor);
// ! for unblocking vendor shop
router.patch("/unblock-vendor-shop", (0, validateUser_1.default)(client_1.UserRole.ADMIN), auth_controller_1.authController.unbBlockVendor);
// ! change password 1st time login
router.patch("/change1st-password", (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.VENDOR, client_1.UserRole.CUSTOMER), auth_controller_1.authController.change1stPassword);
// ! for reseting password
router.patch("/reset-password", auth_controller_1.authController.resetPassWord);
// ! for sending reset link to email
router.patch("/reset-link/:email", auth_controller_1.authController.sendResetLink);
//
exports.authRouter = router;
