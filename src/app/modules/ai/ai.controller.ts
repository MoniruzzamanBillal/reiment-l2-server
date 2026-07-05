import httpStatus from "http-status";
import catchAsync from "../../util/catchAsync";
import pick from "../../util/pick";
import sendResponse from "../../util/sendResponse";
import { productServices } from "../products/product.service";
import { aiServices } from "./ai.service";

// ! for drafting a product title + description with ai
const generateDescription = catchAsync(async (req, res) => {
  const result = await aiServices.generateProductDescription(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Description generated successfully!!!",
    data: result,
  });
});

// ! for chatting with the shopping assistant
const chat = catchAsync(async (req, res) => {
  const result = await aiServices.chatWithAssistant(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Chat response generated successfully!!!",
    data: result,
  });
});

// ! for turning a natural language query into product results
const smartSearch = catchAsync(async (req, res) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const filter = await aiServices.parseSmartSearchQuery(req.body.query);

  const result = await productServices.getAllProducts(options, filter);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Products retrived successfully!!!",
    data: result,
  });
});

//
export const aiController = {
  generateDescription,
  chat,
  smartSearch,
};
