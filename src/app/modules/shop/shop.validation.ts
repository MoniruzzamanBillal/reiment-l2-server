import { z } from "zod";

// ! for crating a shop
const crateShopValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
  }),
});

//
export const shopValidationsSchemas = {
  crateShopValidationSchema,
};
