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
exports.adminService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! for deleting a user
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.user.findUniqueOrThrow({
        where: { id: userId, isDelated: false, status: client_1.UserStatus.ACTIVE },
    });
    yield prisma_1.default.user.update({
        where: {
            id: userId,
        },
        data: { isDelated: true },
    });
});
// ! for blocking a user
const blockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.user.findUniqueOrThrow({
        where: { id: userId, isDelated: false, status: client_1.UserStatus.ACTIVE },
    });
    yield prisma_1.default.user.update({
        where: {
            id: userId,
        },
        data: { status: client_1.UserStatus.BLOCKED },
    });
});
// ! for blocking vendor shop
const blockVendorShop = (shopId) => __awaiter(void 0, void 0, void 0, function* () {
    // npx prisma generate
    yield prisma_1.default.shop.findUniqueOrThrow({
        where: { id: shopId, status: client_1.ShopStatus.ACTIVE },
    });
    yield prisma_1.default.shop.update({
        where: { id: shopId },
        data: { status: client_1.ShopStatus.BLOCKED },
    });
});
//
exports.adminService = {
    deleteUser,
    blockUser,
    blockVendorShop,
};
