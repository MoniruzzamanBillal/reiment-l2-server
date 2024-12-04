import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import sendResponse from "../../util/sendResponse";
import { orderServices } from "./order.service";

// ! for ordering
const orderItem = catchAsync(async (req, res) => {
  const result = await orderServices.orderItem();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Item  ordered successfully!!!",
    data: result,
  });
});

//
export const orderController = {
  orderItem,
};
