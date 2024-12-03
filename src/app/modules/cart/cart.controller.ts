import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { cartServices } from "./cart.service";

const addToCart = catchAsync(async (req, res) => {
  const result = await cartServices.addToCart();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Cart added successfully!!!",
    data: result,
  });
});

//
export const cartController = {
  addToCart,
};
