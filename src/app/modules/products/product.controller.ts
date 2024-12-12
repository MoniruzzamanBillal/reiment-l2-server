import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { productServices } from "./product.service";

// ! for crating a shop
const addProduct = catchAsync(async (req, res) => {
  const result = await productServices.addProduct(req.body, req.file);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Product added successfully!!!",
    data: result,
  });
});

// ! for crating a shop
const updateProduct = catchAsync(async (req, res) => {
  const result = await productServices.updateProduct(
    req.body,
    req.file,
    req.params?.id
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Product updated successfully!!!",
    data: result,
  });
});

// ! for deleting a product
const deleteProduct = catchAsync(async (req, res) => {
  await productServices.deleteProduct(req.params?.id, req.user);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Product deleted successfully!!!",
  });
});

// ! for getting vendor shops product
const getVendorShopProducts = catchAsync(async (req, res) => {
  const result = await productServices.getVendorProduct(req.params?.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Shop Product retrived successfully!!!",
    data: result,
  });
});

// ! for getting all products data
const getAllProducts = catchAsync(async (req, res) => {
  const result = await productServices.getAllProducts();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: " Products retrived successfully!!!",
    data: result,
  });
});

// ! for getting flashsale product
const getFlashSaleProduct = catchAsync(async (req, res) => {
  const result = await productServices.getFlashSellProducts();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: " Products retrived successfully!!!",
    data: result,
  });
});

// ! for getting single product
const getSingleProduct = catchAsync(async (req, res) => {
  const result = await productServices.getSingleProduct(req.params?.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: " Product retrived successfully!!!",
    data: result,
  });
});

// ! for duplicating product
const duplicateProduct = catchAsync(async (req, res) => {
  const result = await productServices.handleDuplicateProduct(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Product Duplicated successfully!!!",
    data: result,
  });
});

//
export const productController = {
  addProduct,
  updateProduct,
  deleteProduct,
  getVendorShopProducts,
  getSingleProduct,
  getAllProducts,
  duplicateProduct,
  getFlashSaleProduct,
};
