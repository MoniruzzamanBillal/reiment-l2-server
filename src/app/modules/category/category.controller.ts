import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { categoryServices } from "./category.service";

// ! for crating category
const createCategory = catchAsync(async (req, res) => {
  const result = await categoryServices.addCategory(req.body, req.file);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Category crated successfully!!!",
    data: result,
  });
});

// ! for getting all category
const getAllCategory = catchAsync(async (req, res) => {
  const result = await categoryServices.getAllCategory();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "All Category retrived successfully!!!",
    data: result,
  });
});

// ! for getting single category
const getSingleCategory = catchAsync(async (req, res) => {
  const result = await categoryServices.getSingleCategory(req.params.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Category retrived successfully!!!",
    data: result,
  });
});

// ! for updating category
const updateCategory = catchAsync(async (req, res) => {
  const result = await categoryServices.updateCategory(
    req.body,
    req.file,
    req.params.id
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Category updated successfully!!!",
    data: result,
  });
});

// ! for deleting category
const deleteCategory = catchAsync(async (req, res) => {
  await categoryServices.deleteCategory(req.params.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Category deleted successfully!!!",
  });
});

//
export const categoryController = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
  getSingleCategory,
};
