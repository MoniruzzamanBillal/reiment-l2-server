"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../util/catchAsync"));
const pick_1 = __importDefault(require("../../util/pick"));
const sendResponse_1 = __importDefault(require("../../util/sendResponse"));
const product_service_1 = require("../products/product.service");
const ai_service_1 = require("./ai.service");
// ! for drafting a product title + description with ai
const generateDescription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ai_service_1.aiServices.generateProductDescription(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Description generated successfully!!!",
        data: result,
    });
}));
// ! for chatting with the shopping assistant
const chat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ai_service_1.aiServices.chatWithAssistant(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Chat response generated successfully!!!",
        data: result,
    });
}));
// ! for turning a natural language query into product results
const smartSearch = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = (0, pick_1.default)(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const filter = yield ai_service_1.aiServices.parseSmartSearchQuery(req.body.query);
    const result = yield product_service_1.productServices.getAllProducts(options, filter);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Products retrived successfully!!!",
        data: result,
    });
}));
//
exports.aiController = {
    generateDescription,
    chat,
    smartSearch,
};
