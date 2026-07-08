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
exports.couponController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../util/catchAsync"));
const sendResponse_1 = __importDefault(require("../../util/sendResponse"));
const coupon_service_1 = require("./coupon.service");
// ! for adding coupon
const addCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coupon_service_1.couponServices.addCoupon(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.CREATED,
        success: true,
        message: "Coupon Created successfully!!!",
        data: result,
    });
}));
// ! for getting all coupon
const getAllCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coupon_service_1.couponServices.getAllCoupon();
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Coupon retrived successfully!!!",
        data: result,
    });
}));
// ! for getting single coupon by id (admin update-page prefill)
const getSingleCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield coupon_service_1.couponServices.getSingleCouponById((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Coupon retrived successfully!!!",
        data: result,
    });
}));
// ! for updating coupon
const updateCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield coupon_service_1.couponServices.updateCoupon((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Coupon updated successfully!!!",
        data: result,
    });
}));
// ! for previewing/applying coupon at checkout
const previewApplyCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = yield coupon_service_1.couponServices.previewApplyCoupon((_a = req.body) === null || _a === void 0 ? void 0 : _a.code, (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Coupon applied successfully!!!",
        data: result,
    });
}));
// ! for deleting coupon code
const deleteCoupon = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield coupon_service_1.couponServices.handleDeleteCoupon((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Coupon deleted successfully!!!",
        data: result,
    });
}));
//
exports.couponController = {
    addCoupon,
    getAllCoupon,
    getSingleCoupon,
    updateCoupon,
    previewApplyCoupon,
    deleteCoupon,
};
