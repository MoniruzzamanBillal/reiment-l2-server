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

//
export const shopController = {
  crateShop,
};
