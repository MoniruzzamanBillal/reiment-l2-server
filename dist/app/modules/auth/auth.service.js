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
exports.authServices = void 0;
// import * as bcrypt from "bcrypt";
const client_1 = require("@prisma/client");
const argon2_1 = __importDefault(require("argon2"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
const sendEmail_1 = require("../../util/sendEmail");
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
const auth_util_1 = require("./auth.util");
// ! for creating user
const createUser = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.username || !payload.email || !payload.password) {
        throw new Error("Missing required fields: username, email, or password");
    }
    let profileImg;
    if (file) {
        const name = payload === null || payload === void 0 ? void 0 : payload.username.trim();
        const path = (file === null || file === void 0 ? void 0 : file.path).trim();
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        profileImg = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
    }
    const hashedPassword = yield argon2_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password);
    payload.password = hashedPassword;
    const userData = yield prisma_1.default.user.create({
        data: {
            username: payload.username,
            email: payload.email,
            password: payload.password,
            profileImg,
            role: payload === null || payload === void 0 ? void 0 : payload.role,
        },
    });
    const jwtPayload = {
        userId: userData === null || userData === void 0 ? void 0 : userData.id,
        userEmail: userData === null || userData === void 0 ? void 0 : userData.email,
        userRole: userData === null || userData === void 0 ? void 0 : userData.role,
    };
    const token = (0, auth_util_1.createToken)(jwtPayload, config_1.default.jwt_secret);
    return {
        userData,
        token,
    };
});
// ! for changing password
const changePassword = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User dont exist!!!");
    }
    const isPasswordMatch = yield argon2_1.default.verify(userData === null || userData === void 0 ? void 0 : userData.password, payload === null || payload === void 0 ? void 0 : payload.oldPassword);
    if (!isPasswordMatch) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Password don't match !!");
    }
    const hashedPassword = yield argon2_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.newPassword);
    const result = yield prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword, needsPasswordChange: false },
    });
    return result;
    //
});
// ! for updating a user
const updateUser = (payload, file, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
            isDelated: false,
        },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User dont exist !!");
    }
    if (file) {
        const name = userData === null || userData === void 0 ? void 0 : userData.username.trim();
        const path = (file === null || file === void 0 ? void 0 : file.path).trim();
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        const profileImg = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
        payload.profileImg = profileImg;
    }
    const result = yield prisma_1.default.user.update({
        where: {
            id: userId,
        },
        data: payload,
    });
    return result;
});
// ! login
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User dont exist !!");
    }
    if (user === null || user === void 0 ? void 0 : user.isDelated) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User is blocked by the admin !!!");
    }
    const isPasswordMatch = yield argon2_1.default.verify(user === null || user === void 0 ? void 0 : user.password, payload === null || payload === void 0 ? void 0 : payload.password);
    if (!isPasswordMatch) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Password don't match !!");
    }
    const jwtPayload = {
        userId: user === null || user === void 0 ? void 0 : user.id,
        userEmail: user === null || user === void 0 ? void 0 : user.email,
        userRole: user === null || user === void 0 ? void 0 : user.role,
    };
    const token = (0, auth_util_1.createToken)(jwtPayload, config_1.default.jwt_secret);
    return {
        user,
        token,
    };
});
// ! for deleting a user
const deleteUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userExist = yield prisma_1.default.user.findUnique({
        where: {
            id: payload === null || payload === void 0 ? void 0 : payload.userId,
        },
    });
    if (!userExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This user don't exist !!!");
    }
    if (userExist === null || userExist === void 0 ? void 0 : userExist.isDelated) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This user is already deleted !!!");
    }
    const result = yield prisma_1.default.user.update({
        where: {
            id: payload === null || payload === void 0 ? void 0 : payload.userId,
        },
        data: {
            isDelated: true,
            status: client_1.UserStatus.BLOCKED,
        },
    });
    return result;
    //
});
// ! for unblocking user
const unblockUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userExist = yield prisma_1.default.user.findUnique({
        where: {
            id: payload === null || payload === void 0 ? void 0 : payload.userId,
        },
    });
    if (!userExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This user don't exist !!!");
    }
    const result = yield prisma_1.default.user.update({
        where: {
            id: payload === null || payload === void 0 ? void 0 : payload.userId,
        },
        data: {
            isDelated: false,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    return result;
});
// ! block vendor shop
const blockVendorShop = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorShopId } = payload;
    const shopData = yield prisma_1.default.shop.findUnique({
        where: {
            id: vendorShopId,
            isDelated: false,
        },
    });
    if (!shopData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Shop data don't exist !!!");
    }
    // block vendor shop
    // delete product for vendor shop
    // delete cart item for that vendror shop
    yield prisma_1.default.$transaction((trxnClient) => __awaiter(void 0, void 0, void 0, function* () {
        // * block vendor shop
        yield trxnClient.shop.update({
            where: {
                id: vendorShopId,
            },
            data: {
                isDelated: true,
                status: client_1.ShopStatus.BLOCKED,
            },
        });
        // * delete vendor shop product
        yield trxnClient.products.updateMany({
            where: {
                shopId: vendorShopId,
            },
            data: {
                isDelated: true,
            },
        });
        // * delete cart items
        yield trxnClient.cartItem.deleteMany({
            where: {
                product: {
                    shopId: vendorShopId,
                },
            },
        });
        //
    }));
    //
});
const unblockVendor = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorShopId } = payload;
    const shopData = yield prisma_1.default.shop.findUnique({
        where: {
            id: vendorShopId,
            isDelated: true,
            status: client_1.ShopStatus.BLOCKED,
        },
    });
    if (!shopData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Shop data don't exist !!!");
    }
    // unblock vendor shop
    // make isDelete false for vendor shop products
    yield prisma_1.default.$transaction((trxnClient) => __awaiter(void 0, void 0, void 0, function* () {
        // * unblock vendor shop
        yield trxnClient.shop.update({
            where: {
                id: vendorShopId,
            },
            data: {
                isDelated: false,
                status: client_1.ShopStatus.ACTIVE,
            },
        });
        // * reverse delete vendor shop product
        yield trxnClient.products.updateMany({
            where: {
                shopId: vendorShopId,
            },
            data: {
                isDelated: false,
            },
        });
    }));
    //
});
// ! send mail for reseting password
const resetMailLink = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const findUser = yield prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (!findUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User don't exist !!");
    }
    if (findUser === null || findUser === void 0 ? void 0 : findUser.isDelated) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User is deleted !!");
    }
    if ((findUser === null || findUser === void 0 ? void 0 : findUser.status) === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User is blocked !!");
    }
    const userId = findUser === null || findUser === void 0 ? void 0 : findUser.id;
    const jwtPayload = {
        userId,
        userRole: findUser === null || findUser === void 0 ? void 0 : findUser.role,
        userEmail: findUser === null || findUser === void 0 ? void 0 : findUser.email,
    };
    const token = (0, auth_util_1.createToken)(jwtPayload, config_1.default.jwt_secret);
    // const resetLink = `http://localhost:5173/reset-password/${token}`;
    const resetLink = `https://reiment-l2-client.vercel.app/reset-password/${token}`;
    const sendMailResponse = yield (0, sendEmail_1.sendEmail)(resetLink, email);
    return sendMailResponse;
});
// ! for reseting password
const resetPasswordFromDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = payload;
    // ! check if  user exist
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User dont exist !!! ");
    }
    if (user === null || user === void 0 ? void 0 : user.isDelated) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User is deleted !!");
    }
    if ((user === null || user === void 0 ? void 0 : user.status) === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User is blocked !!");
    }
    const hashedPassword = yield argon2_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password);
    yield prisma_1.default.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });
    return null;
});
//
exports.authServices = {
    createUser,
    login,
    updateUser,
    deleteUser,
    unblockUser,
    blockVendorShop,
    unblockVendor,
    changePassword,
    resetMailLink,
    resetPasswordFromDb,
};
