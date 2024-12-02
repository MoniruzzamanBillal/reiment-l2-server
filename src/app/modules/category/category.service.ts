import prisma from "../../util/prisma";

type ICategory = {
  name: string;
};

// ! for getting all category
const getAllCategory = async () => {
  const result = await prisma.categories.findMany({
    where: { isDelated: false },
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
const addCategory = async (payload: ICategory) => {
  const result = await prisma.categories.create({
    data: payload,
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
  await prisma.categories.findUniqueOrThrow({
    where: {
      id: categoryId,
      isDelated: false,
    },
  });

  await prisma.categories.update({
    where: {
      id: categoryId,
    },
    data: {
      isDelated: true,
    },
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
