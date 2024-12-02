import { z } from "zod";

// ! for adding product
const addProductValidationSchema = z.object({
  body: z.object({
    shopId: z.string().min(5, "Invalid shopId. Must be a valid UUID."),
    categoryId: z.string().min(2, "Invalid categoryId. Must be a valid UUID."),
    name: z.string().min(1, "Name is required."),
    price: z.number().positive("Price must be a positive number."),
    description: z.string().min(1, "Description is required."),
    inventoryCount: z
      .number()
      .int()
      .nonnegative("Inventory count must be a non-negative integer."),
    discount: z
      .number()
      .positive("Discount must be a positive number.")
      .optional(),
  }),
});

//
export const productValidations = { addProductValidationSchema };
