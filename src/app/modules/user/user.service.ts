import { UserRole } from "@prisma/client";
import prisma from "../../util/prisma";

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

//
export const userServices = { getAllUsers };
