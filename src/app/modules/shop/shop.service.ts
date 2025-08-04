import { ShopStatus, UserRole } from "@prisma/client";
import { IFile } from "../../interface/file";
import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { TShop } from "./shop.interface";

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
      status: ShopStatus.ACTIVE,
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
      status: ShopStatus.ACTIVE,
    },
    data: updatedData,
  });

  return result;
};

// ! for getting all shop data
const getAllShopData = async () => {
  const result = await prisma.shop.findMany({
    include: {
      vendor: {
        select: {
          username: true,
          email: true,
          profileImg: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return result;
};

// ! for getting all shop data (public route )
const getAllPublicShopData = async () => {
  const result = await prisma.shop.findMany({
    where: { status: "ACTIVE" },
    include: {
      vendor: {
        select: {
          username: true,
          email: true,
          profileImg: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return result;
};

// ! for getting user shop
const getVendorShop = async (userId: string) => {
  const result = await prisma.shop.findUnique({
    where: {
      vendorId: userId,
    },
  });

  return result;
};

// ! for getting single shop data
const getSingleShop = async (shopId: string) => {
  const result = await prisma.shop.findUnique({
    where: {
      id: shopId,
      status: ShopStatus.ACTIVE,
    },
    include: {
      Products: true,
      follower: true,
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
  getSingleShop,
  getAllPublicShopData,
};
