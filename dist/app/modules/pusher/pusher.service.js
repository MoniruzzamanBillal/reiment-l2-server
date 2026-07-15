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
exports.pusherServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
const pusher_1 = __importDefault(require("../../util/pusher"));
const VENDOR_CHANNEL_PREFIX = "private-vendor-";
const CUSTOMER_CHANNEL_PREFIX = "private-customer-";
// ! for authorizing a private channel subscription request from pusher-js
const authorizeChannel = (socketId, channelName, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (channelName.startsWith(VENDOR_CHANNEL_PREFIX)) {
        const requestedShopId = channelName.slice(VENDOR_CHANNEL_PREFIX.length);
        const shop = yield prisma_1.default.shop.findUnique({
            where: { vendorId: user.userId },
        });
        if (!shop || shop.id !== requestedShopId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to subscribe to this channel.");
        }
    }
    else if (channelName.startsWith(CUSTOMER_CHANNEL_PREFIX)) {
        const requestedUserId = channelName.slice(CUSTOMER_CHANNEL_PREFIX.length);
        if (requestedUserId !== user.userId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to subscribe to this channel.");
        }
    }
    else {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Unknown channel.");
    }
    return pusher_1.default.authorizeChannel(socketId, channelName);
});
//
exports.pusherServices = {
    authorizeChannel,
};
