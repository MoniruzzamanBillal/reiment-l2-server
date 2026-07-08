"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderValidations = void 0;
const zod_1 = require("zod");
// ! for placing an order
const orderItemValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        cartId: zod_1.z.string().min(1, "cartId is required."),
        couponId: zod_1.z.string().optional(),
    }),
});
//
exports.orderValidations = {
    orderItemValidationSchema,
};
