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
exports.couponServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! for adding coupon
const addCoupon = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const checkExist = yield prisma_1.default.coupon.findFirst({
        where: {
            code: {
                contains: payload === null || payload === void 0 ? void 0 : payload.code,
                mode: "insensitive",
            },
        },
    });
    if (checkExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This coupon already exist!!!");
    }
    const result = yield prisma_1.default.coupon.create({
        data: payload,
    });
    return result;
});
// ! for getting all coupon
const getAllCoupon = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.coupon.findMany();
    return result;
});
const getSingleCoupon = (couponCode) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("coupon code = ", couponCode);
    const checkCoupon = yield prisma_1.default.coupon.findFirst({
        where: {
            code: {
                contains: couponCode,
                mode: "insensitive",
            },
        },
    });
    if (!checkCoupon) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This coupon don't exist!!!");
    }
    return checkCoupon;
});
// ! delete coupon
const handleDeleteCoupon = (couponId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.coupon.delete({ where: { id: couponId } });
});
//
exports.couponServices = {
    addCoupon,
    getSingleCoupon,
    handleDeleteCoupon,
    getAllCoupon,
};
