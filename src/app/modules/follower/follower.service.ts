import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";

// ! for getting logged in user follower shop
const getLoggedUserFollowShop = async (userId: string) => {
  const result = await prisma.follower.findMany({
    where: {
      customerId: userId,
      isDeleted: false,
    },
    include: {
      shop: true,
    },
  });

  return result;
};

// ! for following a shop
const followShop = async (shopId: string, userId: string) => {
  const followerExist = await prisma.follower.findFirst({
    where: {
      customerId: userId,
      shopId,
    },
  });

  if (followerExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are already following this shop !!!"
    );
  }

  const result = await prisma.follower.create({
    data: {
      shopId,
      customerId: userId,
    },
  });

  return result;

  //
};

// ! for unfollow a shop
const unfollowShop = async (shopId: string, userId: string) => {
  const dataExist = await prisma.follower.findFirst({
    where: {
      customerId: userId,
      shopId,
    },
  });

  if (!dataExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not following this shop !!!"
    );
  }

  await prisma.follower.delete({
    where: {
      customerId_shopId: {
        customerId: userId,
        shopId,
      },
    },
  });

  //
};

//
export const followerService = {
  followShop,
  unfollowShop,
  getLoggedUserFollowShop,
};
