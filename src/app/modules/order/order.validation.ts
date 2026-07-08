import { z } from "zod";

// ! for placing an order
const orderItemValidationSchema = z.object({
  body: z.object({
    cartId: z.string().min(1, "cartId is required."),
    couponId: z.string().optional(),
  }),
});

//
export const orderValidations = {
  orderItemValidationSchema,
};
