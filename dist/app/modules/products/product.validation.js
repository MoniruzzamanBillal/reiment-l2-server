"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productValidations = void 0;
const zod_1 = require("zod");
// ! for adding product
const addProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        shopId: zod_1.z.string().min(5, "Invalid shopId. Must be a valid UUID."),
        categoryId: zod_1.z.string().min(2, "Invalid categoryId. Must be a valid UUID."),
        name: zod_1.z.string().min(1, "Name is required."),
        price: zod_1.z.number().positive("Price must be a positive number."),
        description: zod_1.z.string().min(1, "Description is required."),
        inventoryCount: zod_1.z
            .number()
            .int()
            .nonnegative("Inventory count must be a non-negative integer."),
        discount: zod_1.z
            .number()
            .positive("Discount must be a positive number.")
            .optional(),
    }),
});
// ! for updating product
const updateProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required.").optional(),
        price: zod_1.z.number().positive("Price must be a positive number.").optional(),
        description: zod_1.z.string().min(1, "Description is required.").optional(),
        inventoryCount: zod_1.z
            .number()
            .int()
            .nonnegative("Inventory count must be a non-negative integer.")
            .optional(),
        discount: zod_1.z
            .number()
            .positive("Discount must be a positive number.")
            .optional(),
    }),
});
//
exports.productValidations = {
    addProductValidationSchema,
    updateProductValidationSchema,
};
