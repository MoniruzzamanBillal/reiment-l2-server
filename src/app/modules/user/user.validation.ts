import { z } from "zod";

// ! for crating a user
const createUserValidationSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").min(4, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

//
export const userValidations = {
  createUserValidationSchema,
};
