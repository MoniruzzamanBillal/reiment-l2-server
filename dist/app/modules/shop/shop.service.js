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
exports.shopServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../util/prisma"));
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
// ! for crating a shop
const crateShop = (payload, userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: userId,
            isDelated: false,
            role: client_1.UserRole.VENDOR,
        },
    });
    let shopLogo;
    if (file) {
        const name = user === null || user === void 0 ? void 0 : user.username;
        const path = file === null || file === void 0 ? void 0 : file.path;
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        shopLogo = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
    }
    const result = yield prisma_1.default.shop.create({
        data: {
            vendorId: user === null || user === void 0 ? void 0 : user.id,
            name: payload === null || payload === void 0 ? void 0 : payload.name,
            description: payload === null || payload === void 0 ? void 0 : payload.description,
            logo: shopLogo,
        },
    });
    return result;
});
//! update shop detail
const updateShop = (payload, userId, file, shopId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: userId,
            isDelated: false,
            role: client_1.UserRole.VENDOR,
        },
    });
    const shopData = yield prisma_1.default.shop.findUniqueOrThrow({
        where: {
            id: shopId,
            vendorId: user === null || user === void 0 ? void 0 : user.id,
            isDelated: false,
            status: client_1.ShopStatus.ACTIVE,
        },
    });
    let logo;
    if (file) {
        const name = user === null || user === void 0 ? void 0 : user.username;
        const path = file === null || file === void 0 ? void 0 : file.path;
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        logo = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
    }
    const updatedData = {
        name: payload === null || payload === void 0 ? void 0 : payload.name,
        description: payload === null || payload === void 0 ? void 0 : payload.description,
        logo: file ? logo : shopData === null || shopData === void 0 ? void 0 : shopData.logo,
    };
    const result = yield prisma_1.default.shop.update({
        where: {
            id: shopId,
            vendorId: user === null || user === void 0 ? void 0 : user.id,
            status: client_1.ShopStatus.ACTIVE,
        },
        data: updatedData,
    });
    return result;
});
// ! for getting all shop data
const getAllShopData = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.shop.findMany({
        include: {
            vendor: {
                select: {
                    username: true,
                    email: true,
                    profileImg: true,
                },
            },
        },
        orderBy: { updatedAt: "desc" },
    });
    return result;
});
// ! for getting user shop
const getVendorShop = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.shop.findUnique({
        where: {
            vendorId: userId,
        },
    });
    return result;
});
// ! for getting single shop data
const getSingleShop = (shopId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.shop.findUnique({
        where: {
            id: shopId,
            status: client_1.ShopStatus.ACTIVE,
        },
        include: {
            Products: true,
            follower: true,
        },
    });
    return result;
});
//
exports.shopServices = {
    crateShop,
    updateShop,
    getAllShopData,
    getVendorShop,
    getSingleShop,
};
