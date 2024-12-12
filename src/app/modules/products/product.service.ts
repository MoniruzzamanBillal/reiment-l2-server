import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import { IFile } from "../../interface/file";

import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { TShop } from "./product.interface";
import { JwtPayload } from "jsonwebtoken";

// ! for crating a product
const addProduct = async (payload: TShop, file: Partial<IFile> | undefined) => {
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
  });

  return result;
};

// ! for getting all product data
const getAllProducts = async () => {
  const result = await prisma.products.findMany({
    where: {
      isDelated: false,
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

//
export const productServices = {
  addProduct,
  updateProduct,
  deleteProduct,
  getVendorProduct,
  getSingleProduct,
  getAllProducts,
  handleDuplicateProduct,
};
