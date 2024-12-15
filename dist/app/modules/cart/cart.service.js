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
exports.cartServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! for adding to cart
const addToCart = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // check for product
    const productData = yield prisma_1.default.products.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.productId, isDelated: false },
    });
    if (!productData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Product not found");
    }
    if (productData.inventoryCount < payload.quantity) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Insufficient inventory");
    }
    // check for cart data
    let cartData = yield prisma_1.default.cart.findUnique({
        where: { customerId: userId, isDelated: false },
    });
    // for no cart data , create cart data
    if (!cartData) {
        cartData = yield prisma_1.default.cart.create({
            data: {
                customerId: userId,
                vendorId: productData === null || productData === void 0 ? void 0 : productData.shopId,
            },
        });
    }
    // Ensure single vendor per cart
    if (cartData.vendorId !== productData.shopId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You can only add products from a single vendor to the cart.");
    }
    const itemPrice = productData.discount
        ? (productData === null || productData === void 0 ? void 0 : productData.price) - (productData === null || productData === void 0 ? void 0 : productData.discount)
        : productData === null || productData === void 0 ? void 0 : productData.price;
    // Add item to cart
    yield prisma_1.default.cartItem.upsert({
        where: {
            cartId_productId: { cartId: cartData.id, productId: payload.productId },
        },
        update: { quantity: { increment: payload.quantity } },
        create: {
            cartId: cartData.id,
            productId: payload.productId,
            quantity: payload.quantity,
            // price: productData.price,
            price: itemPrice,
        },
    });
    //
});
// ! for adding cart item quantity
const addCartQuantity = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // check for product
    const productData = yield prisma_1.default.products.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.productId, isDelated: false },
    });
    if (!productData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Product not found");
    }
    if (productData.inventoryCount < payload.quantity) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Insufficient inventory");
    }
    // check for cart data
    const cartData = yield prisma_1.default.cart.findUnique({
        where: { customerId: userId, isDelated: false },
    });
    if (!cartData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "No cart available for this user ");
    }
    // Ensure single vendor per cart
    if (cartData.vendorId !== productData.shopId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You can only add products from a single vendor to the cart.");
    }
    // increment cart data quantity
    yield prisma_1.default.cartItem.update({
        where: {
            cartId_productId: { cartId: cartData.id, productId: payload.productId },
        },
        data: {
            quantity: {
                increment: payload === null || payload === void 0 ? void 0 : payload.quantity,
            },
        },
    });
});
// ! for decreasing cart item quantity
const decreaseCartQuantity = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // check for product
    const productData = yield prisma_1.default.products.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.productId, isDelated: false },
    });
    if (!productData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Product not found");
    }
    // check for cart data
    const cartData = yield prisma_1.default.cart.findUnique({
        where: { customerId: userId, isDelated: false },
    });
    if (!cartData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "No cart available for this user ");
    }
    // Ensure single vendor per cart
    if (cartData.vendorId !== productData.shopId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You can only add products from a single vendor to the cart.");
    }
    const cartItemData = yield prisma_1.default.cartItem.findUnique({
        where: {
            cartId_productId: {
                productId: payload === null || payload === void 0 ? void 0 : payload.productId,
                cartId: cartData === null || cartData === void 0 ? void 0 : cartData.id,
            },
        },
    });
    if (!cartItemData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "No cart Item found  ");
    }
    if (cartItemData.quantity <= (payload === null || payload === void 0 ? void 0 : payload.quantity)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You cann't reduce cart quantity !!!");
    }
    // decrement cart data quantity
    yield prisma_1.default.cartItem.update({
        where: {
            cartId_productId: { cartId: cartData.id, productId: payload.productId },
        },
        data: {
            quantity: {
                decrement: payload === null || payload === void 0 ? void 0 : payload.quantity,
            },
        },
    });
});
// ! for replacing cart
const replaceCart = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check for product
    const productData = yield prisma_1.default.products.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.productId, isDelated: false },
    });
    if (!productData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Product not found");
    }
    // delete cart previous cart item
    yield prisma_1.default.cartItem.deleteMany({ where: { cartId: payload.cartId } });
    // update new vendor
    yield prisma_1.default.cart.update({
        where: { id: payload.cartId },
        data: { vendorId: productData === null || productData === void 0 ? void 0 : productData.shopId },
    });
    // Add the new product to the cartItem
    yield prisma_1.default.cartItem.create({
        data: {
            cartId: payload.cartId,
            productId: productData.id,
            quantity: payload.quantity,
            price: productData.price,
        },
    });
});
// ! for getting cart data
const getCartData = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const cartData = yield prisma_1.default.cart.findUnique({
        where: {
            customerId: userId,
            isDelated: false,
        },
        include: {
            cartItem: {
                include: { product: true },
            },
        },
    });
    return cartData;
});
// ! for deleting cart item
const deleteCartItem = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const cartData = yield prisma_1.default.cart.findUnique({
        where: { id: payload.cartId, customerId: userId },
        include: {
            cartItem: true,
        },
    });
    const cartItemData = yield prisma_1.default.cartItem.findUnique({
        where: { id: payload.cartItemId, cartId: payload.cartId },
    });
    if (!cartData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cart  not found");
    }
    if (!cartItemData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cart item not found");
    }
    prisma_1.default.$transaction((trxnClient) => __awaiter(void 0, void 0, void 0, function* () {
        yield trxnClient.cartItem.delete({
            where: {
                id: payload === null || payload === void 0 ? void 0 : payload.cartItemId,
                cartId: payload.cartId,
            },
        });
        const remainingCartItems = yield trxnClient.cartItem.findMany({
            where: { cartId: payload.cartId },
        });
        // if there is no cart item data , then delete cart
        if ((remainingCartItems === null || remainingCartItems === void 0 ? void 0 : remainingCartItems.length) === 0) {
            yield trxnClient.cart.delete({
                where: {
                    id: payload === null || payload === void 0 ? void 0 : payload.cartId,
                    customerId: userId,
                },
            });
        }
        //
    }));
    //
});
//
exports.cartServices = {
    addToCart,
    replaceCart,
    getCartData,
    deleteCartItem,
    addCartQuantity,
    decreaseCartQuantity,
};
