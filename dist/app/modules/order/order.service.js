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
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
const payment_util_1 = require("../payment/payment.util");
const client_1 = require("@prisma/client");
// ! for ordering product
const orderItem = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, cuponId } = payload;
    const trxnNumber = `TXN-${Date.now()}`;
    let discountValue = 0;
    if (cuponId) {
        const couponData = yield prisma_1.default.coupon.findUnique({
            where: {
                id: cuponId,
            },
        });
        discountValue = couponData === null || couponData === void 0 ? void 0 : couponData.discountValue;
    }
    // get cart items
    const cartItems = yield prisma_1.default.cartItem.findMany({
        where: { cartId: cartId },
    });
    if (!cartItems.length) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cart is empty");
    }
    let totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    totalPrice -= discountValue;
    const result = prisma_1.default.$transaction((trxnClient) => __awaiter(void 0, void 0, void 0, function* () {
        // create order data
        const order = yield trxnClient.order.create({
            data: {
                customerId: userId,
                totalPrice,
                trxnNumber,
            },
        });
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
        const transactionResult = yield (0, payment_util_1.initiatePayment)(tracsactionData);
        if (transactionResult === null || transactionResult === void 0 ? void 0 : transactionResult.tran_id) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, transactionResult === null || transactionResult === void 0 ? void 0 : transactionResult.tran_id);
        }
        return transactionResult;
    }));
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
