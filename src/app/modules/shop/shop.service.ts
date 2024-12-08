import { ShopStatus, UserRole } from "@prisma/client";
import prisma from "../../util/prisma";
import { TShop } from "./shop.interface";
import { IFile } from "../../interface/file";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";

// ! for crating a shop
const crateShop = async (
  payload: TShop,
  userId: string,
  file: Partial<IFile> | undefined
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
      isDelated: false,
      role: UserRole.VENDOR,
    },
  });

  let shopLogo;

  if (file) {
    const name = user?.username;
    const path = file?.path;

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    shopLogo = cloudinaryResponse?.secure_url;
  }

  console.log(shopLogo);

  const result = await prisma.shop.create({
    data: {
      vendorId: user?.id,
      name: payload?.name,
      description: payload?.description,
      logo: shopLogo as string,
    },
  });

  return result;
};

//! update shop detail
const updateShop = async (
  payload: Partial<TShop>,
  userId: string,
  file: Partial<IFile> | undefined,
  shopId: string
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
      isDelated: false,
      role: UserRole.VENDOR,
    },
  });

  const shopData = await prisma.shop.findUniqueOrThrow({
    where: {
      id: shopId,
      vendorId: user?.id,
      isDelated: false,
    },
  });

  let logo;

  if (file) {
    const name = user?.username;
    const path = file?.path;

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    logo = cloudinaryResponse?.secure_url;
  }

  const updatedData = {
    name: payload?.name,
    description: payload?.description,
    logo: file ? logo : shopData?.logo,
  };

  const result = await prisma.shop.update({
    where: {
      id: shopId,
      vendorId: user?.id,
    },
    data: updatedData,
  });

  return result;
};

// ! for getting all shop data
const getAllShopData = async () => {
  const result = await prisma.shop.findMany({
    where: {
      status: ShopStatus.ACTIVE,
      isDelated: false,
    },
    include: {
      vendor: {
        select: {
          username: true,
          email: true,
          profileImg: true,
        },
      },
    },
  });

  return result;
};

// ! for getting user shop
const getVendorShop = async (userId: string) => {
  const result = await prisma.shop.findUnique({
    where: {
      vendorId: userId,
      isDelated: false,
    },
  });

  return result;
};

//
export const shopServices = {
  crateShop,
  updateShop,
  getAllShopData,
  getVendorShop,
};
