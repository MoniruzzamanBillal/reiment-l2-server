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
const admin_function_1 = require("./admin.function");
// ! for getting admin statistics
const getAdminStatistics = () => __awaiter(void 0, void 0, void 0, function* () {
    // Count total users
    const totalUsers = yield prisma_1.default.user.count({
        where: { isDelated: false },
    });
    // Count active vendors
    const activeVendors = yield prisma_1.default.user.count({
        where: {
            role: client_1.UserRole.VENDOR,
            status: client_1.UserStatus.ACTIVE,
            isDelated: false,
        },
    });
    // Count blocked vendors
    const blockedVendors = yield prisma_1.default.user.count({
        where: {
            role: client_1.UserRole.VENDOR,
            status: client_1.UserStatus.BLOCKED,
            isDelated: false,
        },
    });
    // Count total orders
    const totalOrders = yield prisma_1.default.order.count({
        where: { isDelated: false },
    });
    // Calculate total revenue (sum of order totalPrice for non-deleted orders)
    const revenueDataPrice = yield prisma_1.default.order.aggregate({
        _sum: { totalPrice: true },
        where: { isDelated: false },
    });
    const totalRevenue = (revenueDataPrice === null || revenueDataPrice === void 0 ? void 0 : revenueDataPrice._sum.totalPrice) || 0;
    const statsData = [
        { value: totalUsers, title: "Total Users" },
        { value: activeVendors, title: "Active Vendors" },
        { value: blockedVendors, title: "Blocked Vendors" },
        { value: totalOrders, title: "Total Orders" },
        { value: totalRevenue, title: "Total Revenue" },
    ];
    const revenueDatas = yield (0, admin_function_1.getRevenueData)();
    const categoryDataPercentage = yield (0, admin_function_1.getCategoryProductPercentageFunc)();
    return {
        statsData,
        revenueDatas,
        categoryDataPercentage,
    };
});
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
    getAdminStatistics,
};
