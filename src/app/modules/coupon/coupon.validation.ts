import { z } from "zod";

// ! for adding coupon
const addCouponValidationSchema = z.object({
  body: z
    .object({
      code: z.string().min(1, "Code is required."),
      discountValue: z
        .number()
        .positive("Discount value must be a positive number."),
      usageLimit: z
        .number()
        .int()
        .positive("Usage limit must be a positive integer."),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: "End date must be after start date.",
      path: ["endDate"],
    }),
});

// ! for updating coupon
const updateCouponValidationSchema = z.object({
  body: z
    .object({
      code: z.string().min(1, "Code is required.").optional(),
      discountValue: z
        .number()
        .positive("Discount value must be a positive number.")
        .optional(),
      usageLimit: z
        .number()
        .int()
        .positive("Usage limit must be a positive integer.")
        .optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    })
    .refine(
      (data) =>
        !data.startDate || !data.endDate || data.endDate > data.startDate,
      {
        message: "End date must be after start date.",
        path: ["endDate"],
      }
    ),
});

// ! for previewing/applying a coupon at checkout
const applyCouponValidationSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Code is required."),
  }),
});

//
export const couponValidations = {
  addCouponValidationSchema,
  updateCouponValidationSchema,
  applyCouponValidationSchema,
};
