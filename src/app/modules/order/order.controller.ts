import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { orderServices } from "./order.service";

// ! for ordering
const orderItem = catchAsync(async (req, res) => {
  const result = await orderServices.orderItem(req.body, req.user?.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Item  ordered successfully!!!",
    data: result?.payment_url,
  });
});

// ! for getting order
const getUserOrder = catchAsync(async (req, res) => {
  const result = await orderServices.getOrder(req.user?.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Order retrived successfully!!!",
    data: result,
  });
});

//
export const orderController = {
  orderItem,
  getUserOrder,
};
