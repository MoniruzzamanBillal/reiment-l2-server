import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { cartServices } from "./cart.service";

// ! for adding product to cart
const addToCart = catchAsync(async (req, res) => {
  await cartServices.addToCart(req.body, req.user.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Item  added to cart successfully!!!",
  });
});

// ! for replacing cart with new vendor product
const replaceCart = catchAsync(async (req, res) => {
  await cartServices.replaceCart(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Cart replaced with the new product successfully!!!",
  });
});

// ! for getting cart data
const getCartData = catchAsync(async (req, res) => {
  const result = await cartServices.getCartData(req.user.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Cart data retrived successfully!!!",
    data: result,
  });
});

// ! for deleting cart item
const deleteCartItem = catchAsync(async (req, res) => {
  await cartServices.deleteCartItem(req.body, req.user.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Item  deleted from cart successfully!!!",
  });
});

// ! for updating cart quantity
const updateCartQuantity = catchAsync(async (req, res) => {
  await cartServices.addCartQuantity(req.body, req.user.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "cart item incremented successfully!!!",
  });
});

// ! for decreasing cart item quantity
const decreaseCartQuantity = catchAsync(async (req, res) => {
  await cartServices.decreaseCartQuantity(req.body, req.user.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "cart item decrement successfully!!!",
  });
});

//
export const cartController = {
  addToCart,
  replaceCart,
  getCartData,
  deleteCartItem,
  updateCartQuantity,
  decreaseCartQuantity,
};
