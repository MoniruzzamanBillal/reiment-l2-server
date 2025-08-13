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
exports.getCategoryProductPercentageFunc = exports.getRevenueData = void 0;
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! for getting revenue data ,
const getRevenueData = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const revenueData = yield prisma_1.default.order.groupBy({
        by: ["createdAt"],
        _sum: { totalPrice: true },
        _count: { id: true },
        where: { isDelated: false },
    });
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const monthlyStats = {};
    revenueData === null || revenueData === void 0 ? void 0 : revenueData.forEach((item) => {
        var _a, _b;
        const monthIndex = new Date(item === null || item === void 0 ? void 0 : item.createdAt).getMonth();
        const monthName = monthNames[monthIndex];
        if (!monthlyStats[monthName]) {
            monthlyStats[monthName] = { revenue: 0, orders: 0 };
        }
        monthlyStats[monthName].revenue += ((_a = item === null || item === void 0 ? void 0 : item._sum) === null || _a === void 0 ? void 0 : _a.totalPrice) || 0;
        monthlyStats[monthName].orders += ((_b = item === null || item === void 0 ? void 0 : item._count) === null || _b === void 0 ? void 0 : _b.id) || 0;
    });
    const revenueDatas = (_a = Object.entries(monthlyStats)) === null || _a === void 0 ? void 0 : _a.map(([month, value]) => ({
        month,
        revenue: value === null || value === void 0 ? void 0 : value.revenue,
        orders: value === null || value === void 0 ? void 0 : value.orders,
    }));
    return revenueDatas;
});
exports.getRevenueData = getRevenueData;
// ! for getting category product percentage
const getCategoryProductPercentageFunc = () => __awaiter(void 0, void 0, void 0, function* () {
    const categoryCounts = yield prisma_1.default.categories.findMany({
        select: {
            name: true,
            products: {
                where: { isDelated: false },
                select: { id: true },
            },
        },
    });
    const totalProducts = categoryCounts.reduce((sum, cat) => sum + (cat === null || cat === void 0 ? void 0 : cat.products.length), 0);
    return categoryCounts.map((cat) => {
        var _a;
        return ({
            name: cat === null || cat === void 0 ? void 0 : cat.name,
            value: totalProducts > 0
                ? Math.round((((_a = cat === null || cat === void 0 ? void 0 : cat.products) === null || _a === void 0 ? void 0 : _a.length) / totalProducts) * 100)
                : 0,
        });
    });
});
exports.getCategoryProductPercentageFunc = getCategoryProductPercentageFunc;
