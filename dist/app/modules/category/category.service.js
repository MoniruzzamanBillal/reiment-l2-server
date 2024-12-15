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
exports.categoryServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
// ! for getting all category
const getAllCategory = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.categories.findMany({
        where: { isDelated: false },
        orderBy: { updatedAt: "desc" },
    });
    return result;
});
// ! for getting specific category
const getSingleCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.categories.findUniqueOrThrow({
        where: {
            id: categoryId,
            isDelated: false,
        },
    });
    return result;
});
// ! for creating category
const addCategory = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let categoryImg;
    if (file) {
        const name = payload === null || payload === void 0 ? void 0 : payload.name.trim();
        const path = file === null || file === void 0 ? void 0 : file.path;
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        categoryImg = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
    }
    const result = yield prisma_1.default.categories.create({
        data: {
            name: payload === null || payload === void 0 ? void 0 : payload.name,
            categoryImg,
        },
    });
    return result;
});
// ! for updating category
const updateCategory = (payload, file, categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const categoryData = yield prisma_1.default.categories.findUnique({
        where: {
            id: categoryId,
            isDelated: false,
        },
    });
    if (!categoryData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Category not found !!!");
    }
    let updatedData;
    if (file) {
        const name = (_a = payload === null || payload === void 0 ? void 0 : payload.name) === null || _a === void 0 ? void 0 : _a.trim();
        const path = (_b = file === null || file === void 0 ? void 0 : file.path) === null || _b === void 0 ? void 0 : _b.trim();
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        const categoryImg = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
        updatedData = Object.assign(Object.assign({}, payload), { categoryImg });
    }
    else {
        updatedData = Object.assign({}, payload);
    }
    const result = yield prisma_1.default.categories.update({
        where: {
            id: categoryId,
        },
        data: updatedData,
    });
    return result;
});
// ! for deleting category
const deleteCategory = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryData = yield prisma_1.default.categories.findUnique({
        where: {
            id: categoryId,
            isDelated: false,
        },
    });
    if (!categoryData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Category don't exist !!!");
    }
    // delete category
    // delete category related product
    // delete category realted cart item
    yield prisma_1.default.$transaction((trxnClient) => __awaiter(void 0, void 0, void 0, function* () {
        // * delete category
        yield trxnClient.categories.update({
            where: {
                id: categoryId,
            },
            data: {
                isDelated: true,
            },
        });
        // * delete category related product
        yield trxnClient.products.updateMany({
            where: {
                categoryId: categoryId,
            },
            data: {
                isDelated: true,
            },
        });
        // * delete cart item
        yield trxnClient.cartItem.deleteMany({
            where: {
                product: {
                    categoryId: categoryId,
                },
            },
        });
    }));
});
//
exports.categoryServices = {
    addCategory,
    updateCategory,
    deleteCategory,
    getAllCategory,
    getSingleCategory,
};
