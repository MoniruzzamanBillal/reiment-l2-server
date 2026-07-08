"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponValidations = void 0;
const zod_1 = require("zod");
// ! for adding coupon
const addCouponValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        code: zod_1.z.string().min(1, "Code is required."),
        discountValue: zod_1.z
            .number()
            .positive("Discount value must be a positive number."),
        usageLimit: zod_1.z
            .number()
            .int()
            .positive("Usage limit must be a positive integer."),
        startDate: zod_1.z.coerce.date(),
        endDate: zod_1.z.coerce.date(),
    })
        .refine((data) => data.endDate > data.startDate, {
        message: "End date must be after start date.",
        path: ["endDate"],
    }),
});
// ! for updating coupon
const updateCouponValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        code: zod_1.z.string().min(1, "Code is required.").optional(),
        discountValue: zod_1.z
            .number()
            .positive("Discount value must be a positive number.")
            .optional(),
        usageLimit: zod_1.z
            .number()
            .int()
            .positive("Usage limit must be a positive integer.")
            .optional(),
        startDate: zod_1.z.coerce.date().optional(),
        endDate: zod_1.z.coerce.date().optional(),
    })
        .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
        message: "End date must be after start date.",
        path: ["endDate"],
    }),
});
// ! for previewing/applying a coupon at checkout
const applyCouponValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(1, "Code is required."),
    }),
});
//
exports.couponValidations = {
    addCouponValidationSchema,
    updateCouponValidationSchema,
    applyCouponValidationSchema,
};
