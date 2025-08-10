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
exports.paymentController = void 0;
const catchAsync_1 = __importDefault(require("../../util/catchAsync"));
const payment_service_1 = require("./payment.service");
// const redirectURL = "http://localhost:5173";
const redirectURL = "https://reiment-l2-client.vercel.app";
// ! for cancel payment
const cancelPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.redirect(`${redirectURL}`);
}));
// ! after successfully payment
const successfullyPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_service_1.paymentServices.successfullyPayment(req === null || req === void 0 ? void 0 : req.body);
    if (!result) {
        throw new Error("Payment unsuccessful");
    }
    if (result) {
        return res.redirect(`${redirectURL}/order-success`);
    }
}));
//
exports.paymentController = {
    cancelPayment,
    successfullyPayment,
};
