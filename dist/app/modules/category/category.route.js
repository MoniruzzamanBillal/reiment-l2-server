"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const category_validations_1 = require("./category.validations");
const category_controller_1 = require("./category.controller");
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
const router = (0, express_1.Router)();
// ! for getting all category
router.get("/all-category", category_controller_1.categoryController.getAllCategory);
// ! for creating a category
router.post("/add-category", SendImageCloudinary_1.upload.single("categoryImg"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateUser_1.default)(client_1.UserRole.ADMIN), 
// validateRequest(categoryValidations.createCategotyValidationSchema),
category_controller_1.categoryController.createCategory);
// ! for getting single category
router.get("/category/:id", category_controller_1.categoryController.getSingleCategory);
// ! for updating category
router.patch("/update-category/:id", SendImageCloudinary_1.upload.single("categoryImg"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateUser_1.default)(client_1.UserRole.ADMIN), (0, validateRequest_1.default)(category_validations_1.categoryValidations.updateCategotyValidationSchema), category_controller_1.categoryController.updateCategory);
// ! for deleting category
router.patch("/delete-category/:id", (0, validateUser_1.default)(client_1.UserRole.ADMIN), category_controller_1.categoryController.deleteCategory);
//
exports.categoryRouter = router;
