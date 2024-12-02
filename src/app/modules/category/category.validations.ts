import { z } from "zod";

// ! for crating category
const createCategotyValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category Name is required"),
  }),
});

// ! for updating category
const updateCategotyValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category Name is required"),
  }),
});

//
export const categoryValidations = {
  createCategotyValidationSchema,
  updateCategotyValidationSchema,
};
