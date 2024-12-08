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
  console.log(req.params?.id);
  const result = await productServices.getVendorProduct(req.params?.id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Shop Product retrived successfully!!!",
    data: result,
  });
});

//
export const productController = {
  addProduct,
  updateProduct,
  deleteProduct,
  getVendorShopProducts,
};
