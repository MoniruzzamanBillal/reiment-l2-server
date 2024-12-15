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
exports.addressService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
// ! add address
const addAddress = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.address.create({
        data: Object.assign(Object.assign({}, payload), { userId }),
    });
    return result;
});
// ! for getting address
const getUserAddress = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.address.findMany({
        where: { userId: userId },
    });
    return result;
});
// ! for updating address
const updateAddress = (payload, addressId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const addressData = yield prisma_1.default.address.findUnique({
        where: {
            id: addressId,
            userId: userId,
        },
    });
    if (!addressData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Address not found!!!");
    }
    const updatedAddress = yield prisma_1.default.address.update({
        where: {
            id: addressId,
            userId: userId,
        },
        data: payload,
    });
    return updatedAddress;
});
// ! for deleting address
const deleteAddress = (addressId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const addressData = yield prisma_1.default.address.findUnique({
        where: {
            id: addressId,
            userId: userId,
        },
    });
    if (!addressData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Address not found!!!");
    }
    yield prisma_1.default.address.update({
        where: {
            id: addressId,
            userId: userId,
        },
        data: { isDeleted: true },
    });
});
//
exports.addressService = {
    addAddress,
    getUserAddress,
    updateAddress,
    deleteAddress,
};
