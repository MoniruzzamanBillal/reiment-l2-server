import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import { IFile } from "../../interface/file";
import prisma from "../../util/prisma";
import { SendImageCloudinary } from "../../util/SendImageCloudinary";

type ICategory = {
  name: string;
};

// ! for getting all category
const getAllCategory = async () => {
  const result = await prisma.categories.findMany({
    where: { isDelated: false },
    orderBy: { updatedAt: "desc" },
  });
  return result;
};

// ! for getting specific category
const getSingleCategory = async (categoryId: string) => {
  const result = await prisma.categories.findUniqueOrThrow({
    where: {
      id: categoryId,
      isDelated: false,
    },
  });
  return result;
};

// ! for creating category
const addCategory = async (
  payload: ICategory,
  file: Partial<IFile> | undefined
) => {
  let categoryImg;

  if (file) {
    const name = payload?.name.trim();
    const path = file?.path;

    const cloudinaryResponse = await SendImageCloudinary(
      path as string,
      name as string
    );
    categoryImg = cloudinaryResponse?.secure_url;
  }

  const result = await prisma.categories.create({
    data: {
      name: payload?.name,
      categoryImg,
    },
  });

  return result;
};

// ! for updating category
const updateCategory = async (payload: ICategory, categoryId: string) => {
  await prisma.categories.findUniqueOrThrow({
    where: {
      id: categoryId,
      isDelated: false,
    },
  });

  const result = await prisma.categories.update({
    where: {
      id: categoryId,
    },
    data: payload,
  });

  return result;
};

// ! for deleting category
const deleteCategory = async (categoryId: string) => {
  const categoryData = await prisma.categories.findUnique({
    where: {
      id: categoryId,
      isDelated: false,
    },
  });

  if (!categoryData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category don't exist !!!");
  }

  // delete category
  // delete category related product
  // delete category realted cart item
  await prisma.$transaction(async (trxnClient) => {
    // * delete category
    await trxnClient.categories.update({
      where: {
        id: categoryId,
      },
      data: {
        isDelated: true,
      },
    });

    // * delete category related product
    await trxnClient.products.updateMany({
      where: {
        categoryId: categoryId,
      },
      data: {
        isDelated: true,
      },
    });

    // * delete cart item
    await trxnClient.cartItem.deleteMany({
      where: {
        product: {
          categoryId: categoryId,
        },
      },
    });
  });
};

//
export const categoryServices = {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getSingleCategory,
};
