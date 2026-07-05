import { z } from "zod";

// ! for generating a product title + description draft
const generateDescriptionValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required."),
    categoryId: z.string().min(1, "categoryId is required."),
    keywords: z.string().optional(),
    price: z.number().positive("Price must be a positive number.").optional(),
  }),
});

// ! for chatting with the shopping assistant
const chatValidationSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required."),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1),
        })
      )
      .max(10)
      .optional(),
  }),
});

// ! for natural language product search
const smartSearchValidationSchema = z.object({
  body: z.object({
    query: z.string().min(1, "Search query is required."),
  }),
});

//
export const aiValidations = {
  generateDescriptionValidationSchema,
  chatValidationSchema,
  smartSearchValidationSchema,
};
