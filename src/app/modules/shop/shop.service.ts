import { UserRole } from "@prisma/client";
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

//
export const shopServices = { crateShop };
