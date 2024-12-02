import prisma from "../../util/prisma";

// ! for deleting a user
const deleteUser = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId, isDelated: false },
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: { isDelated: true },
  });
};

//
export const adminService = {
  deleteUser,
};
