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
exports.paymentServices = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../util/prisma"));
const payment_util_1 = require("./payment.util");
const verifyPayment = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const verifyResult = yield (0, payment_util_1.verifyPay)(transactionId);
    if (verifyResult && (verifyResult === null || verifyResult === void 0 ? void 0 : verifyResult.pay_status) === "Successful") {
        yield prisma_1.default.order.update({
            where: {
                trxnNumber: transactionId,
            },
            data: {
                status: client_1.OrderStatus.COMPLETED,
            },
        });
    }
    return verifyResult;
});
//
exports.paymentServices = {
    verifyPayment,
};
