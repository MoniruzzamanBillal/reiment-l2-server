"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../util/catchAsync"));
const sendResponse_1 = __importDefault(require("../../util/sendResponse"));
const product_service_1 = require("./product.service");
const pick_1 = __importDefault(require("../../util/pick"));
// ! for crating a shop
const addProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_service_1.productServices.addProduct(req.body, req.file);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Product added successfully!!!",
        data: result,
    });
}));
// ! for crating a shop
const updateProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield product_service_1.productServices.updateProduct(req.body, req.file, (_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Product updated successfully!!!",
        data: result,
    });
}));
// ! for deleting a product
const deleteProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield product_service_1.productServices.deleteProduct((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, req.user);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Product deleted successfully!!!",
    });
}));
// ! for getting vendor shops product
const getVendorShopProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield product_service_1.productServices.getVendorProduct((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Shop Product retrived successfully!!!",
        data: result,
    });
}));
// ! for getting all products data
const getAllProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("query from get all products = ", req.query);
    const options = (0, pick_1.default)(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const filter = (0, pick_1.default)(req.query, [
        "searchTerm",
        "categoryId",
        "priceRange",
        "userId",
    ]);
    const result = yield product_service_1.productServices.getAllProducts(options, filter);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: " Products retrived successfully!!!",
        data: result,
    });
}));
// ! for getting flashsale product
const getFlashSaleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_service_1.productServices.getFlashSellProducts();
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: " Products retrived successfully!!!",
        data: result,
    });
}));
// ! get recent products
const getRecentProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const result = yield product_service_1.productServices.getRecentProducts(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Recent Products retrived successfully!!!",
        data: result,
    });
}));
// ! for category related products
const getRelatedProducts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield product_service_1.productServices.getRelatedProducts((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: " Products retrived successfully!!!",
        data: result,
    });
}));
// ! for getting single product
const getSingleProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield product_service_1.productServices.getSingleProduct((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: " Product retrived successfully!!!",
        data: result,
    });
}));
// ! for duplicating product
const duplicateProduct = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_service_1.productServices.handleDuplicateProduct(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Product Duplicated successfully!!!",
        data: result,
    });
}));
//
exports.productController = {
    addProduct,
    updateProduct,
    deleteProduct,
    getVendorShopProducts,
    getSingleProduct,
    getAllProducts,
    duplicateProduct,
    getFlashSaleProduct,
    getRelatedProducts,
    getRecentProducts,
};
