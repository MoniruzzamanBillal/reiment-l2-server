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
exports.productServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
const SendImageCloudinary_1 = require("../../util/SendImageCloudinary");
const paginationHelper_1 = __importDefault(require("../../util/paginationHelper"));
const product_constants_1 = require("./product.constants");
const client_1 = require("@prisma/client");
// ! for crating a product
const addProduct = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const shopData = yield prisma_1.default.shop.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.shopId, isDelated: false, status: client_1.ShopStatus.ACTIVE },
    });
    if (!shopData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Shop don't exist!!!");
    }
    const categoryData = yield prisma_1.default.categories.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.categoryId },
    });
    if (!categoryData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Categoty don't exist!!!");
    }
    let productImg;
    if (file) {
        const name = payload === null || payload === void 0 ? void 0 : payload.name;
        const path = file === null || file === void 0 ? void 0 : file.path;
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        productImg = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
    }
    const result = yield prisma_1.default.products.create({
        data: Object.assign(Object.assign({}, payload), { productImg }),
    });
    return result;
});
// ! for updating product
const updateProduct = (payload, file, prodId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const prodData = yield prisma_1.default.products.findUnique({
        where: {
            id: prodId,
            isDelated: false,
            shopId: payload === null || payload === void 0 ? void 0 : payload.shopId,
        },
    });
    if (!prodData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Product not found !!!");
    }
    let updatedData;
    if (file) {
        const name = (_a = payload === null || payload === void 0 ? void 0 : payload.name) === null || _a === void 0 ? void 0 : _a.trim();
        const path = (_b = file === null || file === void 0 ? void 0 : file.path) === null || _b === void 0 ? void 0 : _b.trim();
        const cloudinaryResponse = yield (0, SendImageCloudinary_1.SendImageCloudinary)(path, name);
        const productImg = cloudinaryResponse === null || cloudinaryResponse === void 0 ? void 0 : cloudinaryResponse.secure_url;
        updatedData = Object.assign(Object.assign({}, payload), { productImg });
    }
    else {
        updatedData = Object.assign({}, payload);
    }
    const result = yield prisma_1.default.products.update({
        where: {
            id: prodId,
        },
        data: updatedData,
    });
    return result;
});
// ! for deleting porduct
const deleteProduct = (prodId, vendorUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const prodData = yield prisma_1.default.products.findUnique({
        where: { id: prodId, isDelated: false },
        include: { shop: true },
    });
    if (!prodData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Product not found !!!");
    }
    if ((vendorUser === null || vendorUser === void 0 ? void 0 : vendorUser.userId) !== ((_a = prodData === null || prodData === void 0 ? void 0 : prodData.shop) === null || _a === void 0 ? void 0 : _a.vendorId)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Only owner can delete this prisuct !!");
    }
    yield prisma_1.default.$transaction((trxnCllient) => __awaiter(void 0, void 0, void 0, function* () {
        // ! delete product
        yield trxnCllient.products.update({
            where: {
                id: prodId,
                shopId: prodData.shopId,
            },
            data: {
                isDelated: true,
            },
        });
        // ! delete cart item
        yield trxnCllient.cartItem.deleteMany({
            where: {
                productId: prodId,
            },
        });
        yield trxnCllient.review.updateMany({
            where: {
                productId: prodId,
            },
            data: {
                isDeleted: true,
            },
        });
    }));
});
// ! for getting vendor product
const getVendorProduct = (shopId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.products.findMany({
        where: {
            shopId: shopId,
            isDelated: false,
        },
        include: {
            shop: true,
            category: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return result;
});
// ! for getting all product data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllProducts = (options, filter) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { page, limit, skip } = (0, paginationHelper_1.default)(options);
    console.log("skip = ", skip);
    const andConditions = [];
    const searchConditions = product_constants_1.productSearchableFields.map((field) => ({
        [field]: {
            contains: filter.searchTerm,
            mode: "insensitive",
        },
    }));
    andConditions.push({
        OR: searchConditions,
    });
    if (filter === null || filter === void 0 ? void 0 : filter.categoryId) {
        andConditions.push({
            categoryId: {
                contains: filter === null || filter === void 0 ? void 0 : filter.categoryId,
            },
        });
    }
    if (filter === null || filter === void 0 ? void 0 : filter.priceRange) {
        andConditions.push({
            price: {
                lte: Number(filter === null || filter === void 0 ? void 0 : filter.priceRange),
            },
        });
    }
    const allProducts = yield prisma_1.default.products.findMany({
        where: {
            AND: andConditions,
            isDelated: false,
        },
        // orderBy: { createdAt: "desc" },
        orderBy: (options === null || options === void 0 ? void 0 : options.sortBy) && (options === null || options === void 0 ? void 0 : options.sortOrder)
            ? { [options === null || options === void 0 ? void 0 : options.sortBy]: options === null || options === void 0 ? void 0 : options.sortOrder }
            : { createdAt: "desc" },
        include: {
            shop: true,
            category: true,
        },
    });
    if (filter === null || filter === void 0 ? void 0 : filter.userId) {
        const userData = yield prisma_1.default.user.findUnique({
            where: { id: filter === null || filter === void 0 ? void 0 : filter.userId },
            include: {
                follower: true,
            },
        });
        const followShopId = (_a = userData === null || userData === void 0 ? void 0 : userData.follower) === null || _a === void 0 ? void 0 : _a.map((follow) => follow === null || follow === void 0 ? void 0 : follow.shopId);
        const followedProducts = allProducts === null || allProducts === void 0 ? void 0 : allProducts.filter((product) => followShopId === null || followShopId === void 0 ? void 0 : followShopId.includes(product.shopId));
        const remainingProducts = allProducts === null || allProducts === void 0 ? void 0 : allProducts.filter((product) => !(followShopId === null || followShopId === void 0 ? void 0 : followShopId.includes(product.shopId)));
        const sortedProducts = [...followedProducts, ...remainingProducts];
        // const paginatedProducts = sortedProducts.slice(skip, skip + limit);
        return sortedProducts;
    }
    else {
        // const paginatedProducts = allProducts.slice(skip, skip + limit);
        return allProducts;
    }
    //
});
// ! for getting flash sale products
const getFlashSellProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.products.findMany({
        where: {
            isDelated: false,
            discount: {
                gte: 80,
            },
        },
        include: {
            shop: true,
            category: true,
        },
    });
    return result;
});
// ! for getting single product
const getSingleProduct = (prodId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.products.findUnique({
        where: {
            id: prodId,
            isDelated: false,
        },
        include: {
            category: true,
            shop: true,
            review: {
                include: {
                    user: true,
                },
            },
        },
    });
    return result;
});
// ! for duplicating a product
const handleDuplicateProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const shopData = yield prisma_1.default.shop.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.shopId, isDelated: false },
    });
    if (!shopData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Shop don't exist!!!");
    }
    const categoryData = yield prisma_1.default.categories.findUnique({
        where: { id: payload === null || payload === void 0 ? void 0 : payload.categoryId },
    });
    if (!categoryData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Categoty don't exist!!!");
    }
    const result = yield prisma_1.default.products.create({
        data: payload,
    });
    return result;
});
// ! for getting related products
const getRelatedProducts = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.products.findMany({
        where: { categoryId },
        take: 4,
    });
    return result;
});
// ! for getting recent products
const getRecentProducts = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.products.findMany({
        where: {
            id: {
                in: payload,
            },
        },
    });
    return result;
});
//
exports.productServices = {
    addProduct,
    updateProduct,
    deleteProduct,
    getVendorProduct,
    getSingleProduct,
    getAllProducts,
    handleDuplicateProduct,
    getFlashSellProducts,
    getRelatedProducts,
    getRecentProducts,
};
