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
exports.initPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const config_1 = __importDefault(require("../../config"));
// ! for initializing payment
const initPayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = {
            store_id: config_1.default.STORE_ID,
            store_passwd: config_1.default.STORE_PASSWORD,
            total_amount: payload === null || payload === void 0 ? void 0 : payload.amount,
            currency: "BDT",
            tran_id: payload === null || payload === void 0 ? void 0 : payload.transactionId,
            // success_url: config.SUCCESS_URL,
            success_url: "https://reiment-l2-server.vercel.app/api/payment/success",
            // success_url: "http://localhost:5000/api/payment/success",
            fail_url: config_1.default.FAIL_URL,
            cancel_url: config_1.default.CANCEL_URL,
            ipn_url: "http://localhost:3030/ipn",
            shipping_method: "Courier",
            product_name: "dummy product",
            product_category: "category",
            product_profile: "general",
            cus_name: payload === null || payload === void 0 ? void 0 : payload.customerName,
            cus_email: payload === null || payload === void 0 ? void 0 : payload.customerEmail,
            cus_add1: "N/A",
            cus_add2: "N/A",
            cus_city: "N/A",
            cus_state: "N/A",
            cus_postcode: "N/A",
            cus_country: "Bangladesh",
            cus_phone: "01711111111",
            cus_fax: "01711111111",
            ship_name: payload === null || payload === void 0 ? void 0 : payload.customerName,
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "N/A",
            ship_state: "N/A",
            ship_postcode: 1000,
            ship_country: "Bangladesh",
        };
        // const response = await axios({
        //   method: "post",
        //   // url: config.SSL_PAYMENT_URL,
        //   url: "https://sandbox.sslcommerz.com/gwprocess/v3/api.php",
        //   data,
        //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
        // });
        const response = yield axios_1.default.post(config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.SSL_PAYMENT_URL, qs_1.default.stringify(data), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        return (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.desc[6]) === null || _b === void 0 ? void 0 : _b.redirectGatewayURL;
    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
});
exports.initPayment = initPayment;
