import { UserStatus } from "@prisma/client";
import prisma from "../../util/prisma";

// ! for deleting a user
const deleteUser = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId, isDelated: false, status: UserStatus.ACTIVE },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { isDelated: true },
  });
};

// ! for blocking a user
const blockUser = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId, isDelated: false, status: UserStatus.ACTIVE },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { status: UserStatus.BLOCKED },
  });
};

//
export const adminService = {
  deleteUser,
  blockUser,
};
