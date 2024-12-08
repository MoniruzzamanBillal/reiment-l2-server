import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { shopServices } from "./shop.service";

// ! for crating a shop
const crateShop = catchAsync(async (req, res) => {
  const result = await shopServices.crateShop(
    req.body,
    req.user?.userId,
    req.file
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Shop created successfully!!!",
    data: result,
  });
});

// ! for updating shop data
const updateShopData = catchAsync(async (req, res) => {
  const result = await shopServices.updateShop(
    req.body,
    req.user?.userId,
    req.file,
    req.params?.id
  );

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Shop updated successfully!!!",
    data: result,
  });
});

// ! for getting all shop data
const getAllShopData = catchAsync(async (req, res) => {
  const result = await shopServices.getAllShopData();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Shop Data retrived successfully!!!",
    data: result,
  });
});

// ! for getting vendor shop
const getVendorShop = catchAsync(async (req, res) => {
  const result = await shopServices.getVendorShop(req.user?.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Vendor Shop Data retrived successfully!!!",
    data: result,
  });
});

//
export const shopController = {
  crateShop,
  updateShopData,
  getAllShopData,
  getVendorShop,
};
