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
    data: result,
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

// ! for getting vendor shops order item products
const getVendorOrderHistory = catchAsync(async (req, res) => {
  const result = await orderServices.getVendorOrderHistory(req.user?.userId);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Vendor shop Order retrived successfully!!!",
    data: result,
  });
});

// ! get all order data
const getAllOrderTransactionData = catchAsync(async (req, res) => {
  const result = await orderServices.getAllTransactionData();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Transaction data retrived successfully!!!",
    data: result,
  });
});

//
export const orderController = {
  orderItem,
  getUserOrder,
  getVendorOrderHistory,
  getAllOrderTransactionData,
};
