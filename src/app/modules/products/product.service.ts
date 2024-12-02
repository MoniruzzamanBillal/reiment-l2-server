import { IFile } from "../../interface/file";
import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { TShop } from "./product.interface";

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

//
export const productServices = {
  addProduct,
};
