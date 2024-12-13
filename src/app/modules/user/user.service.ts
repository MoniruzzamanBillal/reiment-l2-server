import { UserRole } from "@prisma/client";
import prisma from "../../util/prisma";
import AppError from "../../Error/AppError";
import httpStatus from "http-status";
import { TUser } from "./user.interface";

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    where: {
      isDelated: false,
      role: {
        in: [UserRole.CUSTOMER, UserRole.VENDOR],
      },
    },
  });

  return result;
};

// ! for getting logged in user
const getLoggedInUser = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId, isDelated: false },
    select: {
      id: true,
      username: true,
      email: true,
      profileImg: true,
      role: true,
      status: true,
      follower: true,
      review: true,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "User don't exist !!!");
  }

  return result;
};

// ! for updating user profile
const handleUpdaeProfile = async (payload: Partial<TUser>, userId: string) => {
  const result = await prisma.user.update({
    where: {
      id: userId,
      isDelated: false,
    },
    data: payload,
  });

  return result;
};

//
export const userServices = {
  getAllUsers,
  getLoggedInUser,
  handleUpdaeProfile,
};
