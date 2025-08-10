"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
const shop_controller_1 = require("./shop.controller");
const router = (0, express_1.Router)();
// ! for getting all shop data
router.get("/all-shop-data", (0, validateUser_1.default)(client_1.UserRole.ADMIN), shop_controller_1.shopController.getAllShopData);
// ! for getting all shop data (public route )
router.get("/all-shop", shop_controller_1.shopController.getAllPublicShopData);
// ! for getting vendor shop data
router.get("/vendor-shop", (0, validateUser_1.default)(client_1.UserRole.VENDOR), shop_controller_1.shopController.getVendorShop);
// ! for crating a shop
router.post("/create-shop", SendImageCloudinary_1.upload.single("logo"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateUser_1.default)(client_1.UserRole.VENDOR), shop_controller_1.shopController.crateShop);
// ! for getting single shop data
router.get("/shop-detail/:id", shop_controller_1.shopController.getSingleShop);
// ! for updating a shop
router.patch("/update-shop/:id", SendImageCloudinary_1.upload.single("logo"), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, (0, validateUser_1.default)(client_1.UserRole.VENDOR), shop_controller_1.shopController.updateShopData);
//
exports.shopRouter = router;
