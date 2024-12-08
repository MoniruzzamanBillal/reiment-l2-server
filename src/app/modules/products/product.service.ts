import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import { IFile } from "../../interface/file";

import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { TShop } from "./product.interface";
import { JwtPayload } from "jsonwebtoken";

// ! for crating a product
const addProduct = async (payload: TShop, file: Partial<IFile> | undefined) => {
  await prisma.shop.findUniqueOrThrow({
    where: { id: payload?.shopId, isDelated: false },
  });

  await prisma.categories.findUniqueOrThrow({
    where: { id: payload?.categoryId },
  });

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
  await prisma.products.findUniqueOrThrow({
    where: {
      id: prodId,
      isDelated: false,
      shopId: payload?.shopId,
    },
  });

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
  const prodData = await prisma.products.findUniqueOrThrow({
    where: { id: prodId, isDelated: false },
    include: { shop: true },
  });

  if (vendorUser?.userId !== prodData?.shop?.vendorId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Only owner can delete this prisuct !!"
    );
  }

  await prisma.products.update({
    where: {
      id: prodId,
      shopId: prodData?.shopId,
    },
    data: { isDelated: true },
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

//
export const productServices = {
  addProduct,
  updateProduct,
  deleteProduct,
  getVendorProduct,
};
