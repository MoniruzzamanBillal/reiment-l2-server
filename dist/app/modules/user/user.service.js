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
exports.userServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../util/prisma"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({
        where: {
            role: {
                in: [client_1.UserRole.CUSTOMER, client_1.UserRole.VENDOR],
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
    return result;
});
// ! for getting logged in user
const getLoggedInUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUnique({
        where: { id: userId, isDelated: false },
        select: {
            id: true,
            username: true,
            email: true,
            profileImg: true,
            role: true,
            status: true,
            review: true,
            follower: true,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User don't exist !!!");
    }
    return result;
});
// ! for updating user profile
const handleUpdaeProfile = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: {
            id: userId,
            isDelated: false,
        },
        data: payload,
    });
    return result;
});
//
exports.userServices = {
    getAllUsers,
    getLoggedInUser,
    handleUpdaeProfile,
};
