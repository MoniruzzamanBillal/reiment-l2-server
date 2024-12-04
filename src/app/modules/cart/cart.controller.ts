import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { cartServices } from "./cart.service";

const addToCart = catchAsync(async (req, res) => {
  await cartServices.addToCart(req.body, req.user.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Item  added to cart successfully!!!",
  });
});

//
export const cartController = {
  addToCart,
};
