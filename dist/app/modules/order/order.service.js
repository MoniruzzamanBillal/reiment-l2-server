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
exports.orderServices = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const coupon_service_1 = require("../coupon/coupon.service");
const prisma_1 = __importDefault(require("../../util/prisma"));
const pusher_1 = __importDefault(require("../../util/pusher"));
const payment_util_1 = require("../payment/payment.util");
// ! for ordering product
const orderItem = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, couponId } = payload;
    const trxnNumber = `TXN-${Date.now()}`;
    // get cart items (product included so we know which shop(s) to notify after order creation)
    const cartItems = yield prisma_1.default.cartItem.findMany({
        where: { cartId: cartId },
        include: { product: true },
    });
    if (!cartItems.length) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cart is empty");
    }
    const baseTotalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const result = yield prisma_1.default.$transaction((trxnClient) => __awaiter(void 0, void 0, void 0, function* () {
        let discountAmount = 0;
        if (couponId) {
            // re-validate inside the transaction — a preview earlier isn't a guarantee at commit time
            const coupon = yield trxnClient.coupon.findFirst({
                where: { id: couponId, isDeleted: false },
            });
            if (!coupon) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Coupon code not found.");
            }
            (0, coupon_service_1.assertCouponDatesValid)(coupon);
            // atomic system-wide claim: only succeeds if a slot is still available,
            // so concurrent checkouts serialize on the row lock instead of over-claiming
            const claim = yield trxnClient.coupon.updateMany({
                where: { id: couponId, usedCount: { lt: coupon.usageLimit } },
                data: { usedCount: { increment: 1 } },
            });
            if (claim.count === 0) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This coupon has reached its maximum usage limit and can no longer be used.");
            }
            discountAmount = coupon.discountValue;
        }
        const totalPrice = baseTotalPrice - discountAmount;
        // create order data
        const order = yield trxnClient.order.create({
            data: {
                customerId: userId,
                totalPrice,
                trxnNumber,
                couponId: couponId !== null && couponId !== void 0 ? couponId : null,
                discountAmount,
            },
        });
        if (couponId) {
            // atomic per-user claim — the [couponId, userId] unique constraint is the
            // enforcement point; a violation here rolls back the usedCount increment
            // and order creation above, together, since it's all one transaction
            try {
                yield trxnClient.couponUsage.create({
                    data: { couponId, userId, orderId: order.id },
                });
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002") {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already used this coupon.");
                }
                throw error;
            }
        }
        // crete order item data
        const orderItems = cartItems.map((item) => ({
            orderId: order === null || order === void 0 ? void 0 : order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
        }));
        // create order item
        yield trxnClient.orderItem.createMany({ data: orderItems });
        // delete cart item
        yield trxnClient.cartItem.deleteMany({
            where: {
                cartId,
            },
        });
        // delete cart
        yield trxnClient.cart.delete({
            where: {
                id: cartId,
            },
        });
        // reduce product inventory quantity
        for (const item of cartItems) {
            yield trxnClient.products.update({
                where: { id: item === null || item === void 0 ? void 0 : item.productId },
                data: {
                    inventoryCount: {
                        decrement: item === null || item === void 0 ? void 0 : item.quantity,
                    },
                },
            });
        }
        const userData = yield trxnClient.user.findUnique({
            where: { id: userId },
        });
        // * initiate payment
        const tracsactionData = {
            transactionId: trxnNumber,
            amount: totalPrice,
            customerName: userData === null || userData === void 0 ? void 0 : userData.username,
            customerEmail: userData === null || userData === void 0 ? void 0 : userData.email,
            userId: userId,
        };
        const transactionResult = yield (0, payment_util_1.initPayment)(tracsactionData);
        return transactionResult;
    }), { timeout: 20000 });
    // fire-and-forget: notify each shop involved in this order of a new order.
    // never let a Pusher failure affect the already-committed order/payment flow.
    try {
        const order = yield prisma_1.default.order.findFirst({ where: { trxnNumber } });
        if (order) {
            const shopIds = Array.from(new Set(cartItems.map((item) => item.product.shopId)));
            yield Promise.all(shopIds.map((shopId) => pusher_1.default.trigger(`private-vendor-${shopId}`, "new-order", {
                orderId: order.id,
                trxnNumber: order.trxnNumber,
                totalPrice: order.totalPrice,
            })));
        }
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Pusher new-order trigger failed:", error);
    }
    return result;
});
// ! for getting user order
const getOrder = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.order.findMany({
        where: {
            customerId: userId,
            isDelated: false,
        },
        include: {
            orderItem: {
                include: {
                    product: true,
                },
            },
        },
    });
    return result;
});
// ! for getting vendor shops order item products
const getVendorOrderHistory = (vendorUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield prisma_1.default.shop.findUnique({
        where: {
            vendorId: vendorUserId,
        },
    });
    if (!shop) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Shop not found for this vendor.");
    }
    const orderItems = prisma_1.default.order.findMany({
        where: {
            orderItem: {
                some: {
                    product: {
                        shopId: shop === null || shop === void 0 ? void 0 : shop.id,
                    },
                },
            },
        },
        include: {
            orderItem: {
                include: {
                    product: true,
                },
            },
            customer: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return orderItems;
});
// ! for getting all transaction data
const getAllTransactionData = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.order.findMany({
        where: { isDelated: false, status: client_1.OrderStatus.COMPLETED },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
    });
    return result;
});
//
exports.orderServices = {
    orderItem,
    getOrder,
    getVendorOrderHistory,
    getAllTransactionData,
};
