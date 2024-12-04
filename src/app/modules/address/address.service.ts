import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import prisma from "../../util/prisma";
import { TAddress } from "./address.interface";

// ! add address
const addAddress = async (payload: TAddress, userId: string) => {
  const result = await prisma.address.create({
    data: {
      ...payload,
      userId,
    },
  });

  return result;
};

// ! for getting address
const getUserAddress = async (userId: string) => {
  const result = await prisma.address.findMany({
    where: { userId: userId },
  });

  return result;
};

// ! for updating address
const updateAddress = async (
  payload: Partial<TAddress>,
  addressId: string,
  userId: string
) => {
  const addressData = await prisma.address.findUnique({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (!addressData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Address not found!!!");
  }

  const updatedAddress = await prisma.address.update({
    where: {
      id: addressId,
      userId: userId,
    },
    data: payload,
  });

  return updatedAddress;
};

// ! for deleting address
const deleteAddress = async (addressId: string, userId: string) => {
  const addressData = await prisma.address.findUnique({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (!addressData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Address not found!!!");
  }

  await prisma.address.update({
    where: {
      id: addressId,
      userId: userId,
    },
    data: { isDeleted: true },
  });
};

//

export const addressService = {
  addAddress,
  getUserAddress,
  updateAddress,
  deleteAddress,
};
