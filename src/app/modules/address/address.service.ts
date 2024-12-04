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

//

export const addressService = {
  addAddress,
};
