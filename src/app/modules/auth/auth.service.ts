import * as bcrypt from "bcrypt";
import { IFile } from "../../interface/file";
import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";
import { TLogin, TUser } from "../user/user.interface";
import { ShopStatus, UserStatus } from "@prisma/client";
import AppError from "../../Error/AppError";
import httpStatus from "http-status";
import { createToken } from "./auth.util";
import config from "../../config";

// ! for creating user
const createUser = async (
  payload: Partial<TUser>,
  file: Partial<IFile> | undefined
) => {
  if (!payload.username || !payload.email || !payload.password) {
    throw new Error("Missing required fields: username, email, or password");
  }

  let profileImg;

  if (file) {
    const name = payload?.username.trim();
    const path = (file?.path as string).trim();

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    profileImg = cloudinaryResponse?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(payload?.password, 20);

  payload.password = hashedPassword;

  const result = await prisma.user.create({
    data: {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      profileImg,
    },
  });

  return result;
};

// ! for updating a user
const updateUser = async (
  payload: { name: string; email: string; profileImg?: string },
  file: Partial<IFile> | undefined,
  userId: string
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
      isDelated: false,
    },
  });

  if (!userData) {
    throw new AppError(httpStatus.BAD_REQUEST, "User dont exist !!");
  }

  if (file) {
    const name = userData?.username.trim();
    const path = (file?.path as string).trim();

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    const profileImg = cloudinaryResponse?.secure_url;
    payload.profileImg = profileImg;
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
  });

  return result;
};

// ! login
const login = async (payload: TLogin) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User dont exist !!");
  }

  if (user?.isDelated) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is blocked by the admin !!!"
    );
  }

  const { password: userPassword, ...userData } = user;

  const isPasswordMatch = await bcrypt.compare(payload?.password, userPassword);

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, "Password don't match !!");
  }

  const jwtPayload = {
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role,
  };

  const token = createToken(jwtPayload, config.jwt_secret as string, "20d");

  return {
    userData,
    token,
  };
};

// ! for deleting a user
const deleteUser = async (payload: { userId: string }) => {
  const userExist = await prisma.user.findUnique({
    where: {
      id: payload?.userId,
    },
  });

  if (!userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "This user don't exist !!!");
  }

  if (userExist?.isDelated) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This user is already deleted !!!"
    );
  }

  const result = await prisma.user.update({
    where: {
      id: payload?.userId,
    },
    data: {
      isDelated: true,
      status: UserStatus.BLOCKED,
    },
  });

  return result;

  //
};

// ! for unblocking user
const unblockUser = async (payload: { userId: string }) => {
  const userExist = await prisma.user.findUnique({
    where: {
      id: payload?.userId,
    },
  });

  if (!userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "This user don't exist !!!");
  }

  const result = await prisma.user.update({
    where: {
      id: payload?.userId,
    },
    data: {
      isDelated: false,
      status: UserStatus.ACTIVE,
    },
  });

  return result;
};

// ! block vendor shop
const blockVendorShop = async (payload: { vendorShopId: string }) => {
  const { vendorShopId } = payload;

  const shopData = await prisma.shop.findUnique({
    where: {
      id: vendorShopId,
      isDelated: false,
    },
  });

  if (!shopData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop data don't exist !!!");
  }

  // block vendor shop
  // delete product for vendor shop
  // delete cart item for that vendror shop
  await prisma.$transaction(async (trxnClient) => {
    // * block vendor shop
    await trxnClient.shop.update({
      where: {
        id: vendorShopId,
      },
      data: {
        isDelated: true,
        status: ShopStatus.BLOCKED,
      },
    });

    // * delete vendor shop product
    await trxnClient.products.updateMany({
      where: {
        shopId: vendorShopId,
      },
      data: {
        isDelated: true,
      },
    });

    // * delete cart items
    await trxnClient.cartItem.deleteMany({
      where: {
        product: {
          shopId: vendorShopId,
        },
      },
    });

    //
  });

  //
};

const unblockVendor = async (payload: { vendorShopId: string }) => {
  const { vendorShopId } = payload;

  const shopData = await prisma.shop.findUnique({
    where: {
      id: vendorShopId,
      isDelated: true,
      status: ShopStatus.BLOCKED,
    },
  });

  if (!shopData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Shop data don't exist !!!");
  }

  // unblock vendor shop
  // make isDelete false for vendor shop products
  await prisma.$transaction(async (trxnClient) => {
    // * unblock vendor shop
    await trxnClient.shop.update({
      where: {
        id: vendorShopId,
      },
      data: {
        isDelated: false,
        status: ShopStatus.ACTIVE,
      },
    });

    // * reverse delete vendor shop product
    await trxnClient.products.updateMany({
      where: {
        shopId: vendorShopId,
      },
      data: {
        isDelated: false,
      },
    });
  });

  //
};

//
export const authServices = {
  createUser,
  login,
  updateUser,
  deleteUser,
  unblockUser,
  blockVendorShop,
  unblockVendor,
};
