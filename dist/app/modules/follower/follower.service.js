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
exports.followerService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! for getting logged in user follower shop
const getLoggedUserFollowShop = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.follower.findMany({
        where: {
            customerId: userId,
            isDeleted: false,
        },
        include: {
            shop: true,
        },
    });
    return result;
});
// ! for following a shop
const followShop = (shopId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const followerExist = yield prisma_1.default.follower.findFirst({
        where: {
            customerId: userId,
            shopId,
        },
    });
    if (followerExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You are already following this shop !!!");
    }
    const result = yield prisma_1.default.follower.create({
        data: {
            shopId,
            customerId: userId,
        },
    });
    return result;
    //
});
// ! for unfollow a shop
const unfollowShop = (shopId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const dataExist = yield prisma_1.default.follower.findFirst({
        where: {
            customerId: userId,
            shopId,
        },
    });
    if (!dataExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You are not following this shop !!!");
    }
    yield prisma_1.default.follower.delete({
        where: {
            customerId_shopId: {
                customerId: userId,
                shopId,
            },
        },
    });
    //
});
//
exports.followerService = {
    followShop,
    unfollowShop,
    getLoggedUserFollowShop,
};
