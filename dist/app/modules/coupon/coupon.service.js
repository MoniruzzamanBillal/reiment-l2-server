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
exports.couponServices = exports.assertCouponDatesValid = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! shared date-range check, reused by order.service.ts at commit time
const assertCouponDatesValid = (coupon) => {
    const now = new Date();
    if (now < coupon.startDate) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `This coupon is not active yet. It becomes valid on ${coupon.startDate.toDateString()}.`);
    }
    if (now > coupon.endDate) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `This coupon expired on ${coupon.endDate.toDateString()}.`);
    }
};
exports.assertCouponDatesValid = assertCouponDatesValid;
// ! for adding coupon
const addCoupon = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const checkExist = yield prisma_1.default.coupon.findFirst({
        where: {
            code: {
                equals: payload === null || payload === void 0 ? void 0 : payload.code,
                mode: "insensitive",
            },
            isDeleted: false,
        },
    });
    if (checkExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This coupon already exist!!!");
    }
    const result = yield prisma_1.default.coupon.create({
        data: Object.assign(Object.assign({}, payload), { 
            // validateRequest's zod coercion doesn't write back to req.body, so
            // startDate/endDate still arrive as raw date-only strings here
            startDate: new Date(payload.startDate), endDate: new Date(payload.endDate) }),
    });
    return result;
});
// ! for getting all coupon
const getAllCoupon = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.coupon.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
    });
    return result;
});
// ! for getting single coupon by id (admin update-page prefill)
const getSingleCouponById = (couponId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.coupon.findFirst({
        where: { id: couponId, isDeleted: false },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Coupon not found.");
    }
    return result;
});
// ! for updating coupon
const updateCoupon = (couponId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const couponData = yield prisma_1.default.coupon.findFirst({
        where: { id: couponId, isDeleted: false },
    });
    if (!couponData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Coupon not found.");
    }
    const result = yield prisma_1.default.coupon.update({
        where: { id: couponId },
        data: Object.assign(Object.assign(Object.assign({}, payload), (payload.startDate && { startDate: new Date(payload.startDate) })), (payload.endDate && { endDate: new Date(payload.endDate) })),
    });
    return result;
});
// ! delete coupon (soft delete)
const handleDeleteCoupon = (couponId) => __awaiter(void 0, void 0, void 0, function* () {
    const couponData = yield prisma_1.default.coupon.findFirst({
        where: { id: couponId, isDeleted: false },
    });
    if (!couponData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Coupon not found.");
    }
    const result = yield prisma_1.default.coupon.update({
        where: { id: couponId },
        data: { isDeleted: true },
    });
    return result;
});
// ! read-only validity check: existence, date range, usage limit
const validateCouponForUse = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield prisma_1.default.coupon.findFirst({
        where: {
            code: { equals: code, mode: "insensitive" },
            isDeleted: false,
        },
    });
    if (!coupon) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Coupon code not found.");
    }
    (0, exports.assertCouponDatesValid)(coupon);
    if (coupon.usedCount >= coupon.usageLimit) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This coupon has reached its maximum usage limit and can no longer be used.");
    }
    return coupon;
});
// ! read-only check: has this user already used this coupon
const checkUserCouponEligibility = (couponId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUsage = yield prisma_1.default.couponUsage.findUnique({
        where: {
            couponId_userId: {
                couponId,
                userId,
            },
        },
    });
    if (existingUsage) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already used this coupon.");
    }
});
// ! checkout "preview apply" — read-only, no mutation
const previewApplyCoupon = (code, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const coupon = yield validateCouponForUse(code);
    yield checkUserCouponEligibility(coupon.id, userId);
    return coupon;
});
//
exports.couponServices = {
    addCoupon,
    updateCoupon,
    getAllCoupon,
    getSingleCouponById,
    handleDeleteCoupon,
    previewApplyCoupon,
    validateCouponForUse,
    checkUserCouponEligibility,
};
