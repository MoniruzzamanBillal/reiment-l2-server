import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import { IFile } from "../../interface/file";

import { ShopStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import calculatePagination, {
  IPaginationOptions,
} from "../../util/paginationHelper";
import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { productSearchableFields } from "./product.constants";
import { TShop } from "./product.interface";

// ! for crating a product
const addProduct = async (payload: TShop, file: Partial<IFile> | undefined) => {
  const shopData = await prisma.shop.findUnique({
    where: { id: payload?.shopId, isDelated: false, status: ShopStatus.ACTIVE },
  });

  if (!shopData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop don't exist!!!");
  }

  const categoryData = await prisma.categories.findUnique({
    where: { id: payload?.categoryId },
  });

  if (!categoryData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Categoty don't exist!!!");
  }

  let productImg;

  if (file) {
    const name = payload?.name;
    const path = file?.path;

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    productImg = cloudinaryResponse?.secure_url;
  }

  const result = await prisma.products.create({
    data: {
      ...payload,
      productImg,
    },
  });

  return result;
};

// ! for updating product
const updateProduct = async (
  payload: Partial<TShop>,
  file: Partial<IFile> | undefined,
  prodId: string
) => {
  const prodData = await prisma.products.findUnique({
    where: {
      id: prodId,
      isDelated: false,
      shopId: payload?.shopId,
    },
  });

  if (!prodData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found !!!");
  }

  let updatedData;
  if (file) {
    const name = payload?.name?.trim() as string;
    const path = file?.path?.trim() as string;

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    const productImg = cloudinaryResponse?.secure_url;

    updatedData = {
      ...payload,
      productImg,
    };
  } else {
    updatedData = {
      ...payload,
    };
  }

  const result = await prisma.products.update({
    where: {
      id: prodId,
    },
    data: updatedData,
  });

  return result;
};

// ! for deleting porduct
const deleteProduct = async (prodId: string, vendorUser: JwtPayload) => {
  const prodData = await prisma.products.findUnique({
    where: { id: prodId, isDelated: false },
    include: { shop: true },
  });

  if (!prodData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found !!!");
  }

  if (vendorUser?.userId !== prodData?.shop?.vendorId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Only owner can delete this prisuct !!"
    );
  }

  await prisma.$transaction(async (trxnCllient) => {
    // ! delete product
    await trxnCllient.products.update({
      where: {
        id: prodId,
        shopId: prodData.shopId,
      },
      data: {
        isDelated: true,
      },
    });

    // ! delete cart item
    await trxnCllient.cartItem.deleteMany({
      where: {
        productId: prodId,
      },
    });

    await trxnCllient.review.updateMany({
      where: {
        productId: prodId,
      },
      data: {
        isDeleted: true,
      },
    });
  });
};

// ! for getting vendor product
const getVendorProduct = async (shopId: string) => {
  const result = await prisma.products.findMany({
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
};

// ! for getting all product data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllProducts = async (options: IPaginationOptions, filter: any) => {
  const { limit, skip } = calculatePagination(options);

  const andConditions = [];

  const searchConditions = productSearchableFields.map((field) => ({
    [field]: {
      contains: filter.searchTerm,
      mode: "insensitive",
    },
  }));

  andConditions.push({
    OR: searchConditions,
  });

  if (filter?.categoryId) {
    andConditions.push({
      categoryId: {
        contains: filter?.categoryId,
      },
    });
  }

  if (filter?.priceRange) {
    andConditions.push({
      price: {
        lte: Number(filter?.priceRange),
      },
    });
  }

  const allProducts = await prisma.products.findMany({
    where: {
      AND: andConditions,
      isDelated: false,
    },
    orderBy:
      options?.sortBy && options?.sortOrder
        ? { [options?.sortBy]: options?.sortOrder }
        : { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      shop: true,
      category: true,
    },
  });

  const totalItems = await prisma.products.count({
    where: { isDelated: false },
  });

  return {
    data: allProducts,
    meta: {
      totalItems,
      page: options?.page,
      limit: options?.limit,
    },
  };

  //
};

// ! for getting flash sale products
const getFlashSellProducts = async () => {
  const result = await prisma.products.findMany({
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
};

// ! for getting single product
const getSingleProduct = async (prodId: string) => {
  const result = await prisma.products.findUnique({
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
};

// ! for duplicating a product
const handleDuplicateProduct = async (payload: TShop) => {
  const shopData = await prisma.shop.findUnique({
    where: { id: payload?.shopId, isDelated: false },
  });

  if (!shopData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop don't exist!!!");
  }

  const categoryData = await prisma.categories.findUnique({
    where: { id: payload?.categoryId },
  });

  if (!categoryData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Categoty don't exist!!!");
  }

  const result = await prisma.products.create({
    data: payload,
  });

  return result;
};

// ! for getting related products
const getRelatedProducts = async (categoryId: string) => {
  const result = await prisma.products.findMany({
    where: { categoryId },
    take: 4,
  });
  return result;
};

// ! for getting recent products
const getRecentProducts = async (payload: string[]) => {
  const result = await prisma.products.findMany({
    where: {
      id: {
        in: payload,
      },
    },
  });

  return result;
};

//
export const productServices = {
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
