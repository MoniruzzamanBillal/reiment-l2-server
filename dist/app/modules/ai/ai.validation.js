"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiValidations = void 0;
const zod_1 = require("zod");
// ! for generating a product title + description draft
const generateDescriptionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required."),
        categoryId: zod_1.z.string().min(1, "categoryId is required."),
        keywords: zod_1.z.string().optional(),
        price: zod_1.z.number().positive("Price must be a positive number.").optional(),
    }),
});
// ! for chatting with the shopping assistant
const chatValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(1, "Message is required."),
        history: zod_1.z
            .array(zod_1.z.object({
            role: zod_1.z.enum(["user", "assistant"]),
            content: zod_1.z.string().min(1),
        }))
            .max(10)
            .optional(),
    }),
});
// ! for natural language product search
const smartSearchValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        query: zod_1.z.string().min(1, "Search query is required."),
    }),
});
//
exports.aiValidations = {
    generateDescriptionValidationSchema,
    chatValidationSchema,
    smartSearchValidationSchema,
};
