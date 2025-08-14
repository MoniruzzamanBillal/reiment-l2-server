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
exports.reviewServices = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! give review
const createReview = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const orderItemData = yield prisma_1.default.orderItem.findFirst({
        where: {
            productId: payload === null || payload === void 0 ? void 0 : payload.productId,
            isReviewed: false,
            order: {
                customerId: userId,
                status: client_1.OrderStatus.COMPLETED,
            },
        },
    });
    if (!orderItemData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid order item or product. !!");
    }
    // Check if a review already exists for this order item
    const existingReview = yield prisma_1.default.review.findUnique({
        where: { orderItemId: orderItemData === null || orderItemData === void 0 ? void 0 : orderItemData.id },
    });
    if (existingReview) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Already given review !!");
    }
    const result = prisma_1.default.$transaction((trnxClient) => __awaiter(void 0, void 0, void 0, function* () {
        const review = yield trnxClient.review.create({
            data: {
                orderItemId: orderItemData === null || orderItemData === void 0 ? void 0 : orderItemData.id,
                productId: payload === null || payload === void 0 ? void 0 : payload.productId,
                userId,
                rating: payload.rating,
                comment: payload.comment,
            },
        });
        yield trnxClient.orderItem.update({
            where: {
                id: orderItemData === null || orderItemData === void 0 ? void 0 : orderItemData.id,
                productId: payload === null || payload === void 0 ? void 0 : payload.productId,
            },
            data: {
                isReviewed: true,
            },
        });
        return review;
    }));
    return result;
    //
});
// ! check eligibility for giving review
const checkEligibleFroReview = (prodId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.orderItem.findFirst({
        where: {
            productId: prodId,
            isReviewed: false,
            order: {
                customerId: userId,
                status: client_1.OrderStatus.COMPLETED,
            },
        },
    });
    console.log("check eligible product = ", result);
    return result;
});
// ! get vendor shops product review
const getVendorProductReviews = (vendorUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield prisma_1.default.shop.findUnique({
        where: { vendorId: vendorUserId },
    });
    if (!shop) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Shop not found for this vendor.");
    }
    const reviews = yield prisma_1.default.review.findMany({
        where: {
            product: {
                shopId: shop === null || shop === void 0 ? void 0 : shop.id,
            },
        },
        include: {
            product: true,
            user: true,
        },
        orderBy: { updatedAt: "desc" },
    });
    return reviews;
    //
});
// ! get all review
const getAllReview = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findMany({
        where: { isDeleted: false },
        include: {
            product: true,
            user: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return result;
});
// ! for getting recent 3 reviews
const getRecentReview = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findMany({
        where: { isDeleted: false },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                },
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    profileImg: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
    });
    return result;
});
// ! update review
const updateReview = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId, comment } = payload;
    // console.log(payload);
    const reviewData = yield prisma_1.default.review.findUnique({
        where: {
            id: reviewId,
        },
    });
    if (!reviewData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Review dont exist !!!");
    }
    const result = yield prisma_1.default.review.update({
        where: { id: reviewId },
        data: { comment },
    });
    return result;
});
//
exports.reviewServices = {
    createReview,
    checkEligibleFroReview,
    getVendorProductReviews,
    getAllReview,
    updateReview,
    getRecentReview,
};
