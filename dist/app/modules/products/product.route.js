"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const router = (0, express_1.Router)();
// ! for getting all product
router.get("/all-products", product_controller_1.productController.getAllProducts);
// ! for getting flash sale  products
router.get("/flashsale-products", product_controller_1.productController.getFlashSaleProduct);
// ! for adding product
router.post("/add-product", SendImageCloudinary_1.upload.single("prodImg"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateUser_1.default)(client_1.UserRole.VENDOR), (0, validateRequest_1.default)(product_validation_1.productValidations.addProductValidationSchema), product_controller_1.productController.addProduct);
// ! for duplicating a product
router.post("/duplicate-product", (0, validateUser_1.default)(client_1.UserRole.VENDOR), product_controller_1.productController.duplicateProduct);
// ! for getting recent products
router.patch("/recent-products", product_controller_1.productController.getRecentProducts);
// ! for getting vendor shop's product
router.get("/get-vendor-product/:id", product_controller_1.productController.getVendorShopProducts);
// ! for getting vendor shop's product
router.get("/get-related-products/:id", product_controller_1.productController.getRelatedProducts);
// ! for getting single product
router.get("/get-product/:id", product_controller_1.productController.getSingleProduct);
// ! for updating product
router.patch("/update-product/:id", SendImageCloudinary_1.upload.single("prodImg"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateUser_1.default)(client_1.UserRole.VENDOR), (0, validateRequest_1.default)(product_validation_1.productValidations.updateProductValidationSchema), product_controller_1.productController.updateProduct);
// ! for deleting a product
router.patch("/delete-product/:id", (0, validateUser_1.default)(client_1.UserRole.VENDOR), product_controller_1.productController.deleteProduct);
//
exports.productRouter = router;
