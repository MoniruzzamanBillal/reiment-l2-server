"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryValidations = void 0;
const zod_1 = require("zod");
// ! for crating category
const createCategotyValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Category Name is required"),
    }),
});
// ! for updating category
const updateCategotyValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Category Name is required").optional(),
    }),
});
//
exports.categoryValidations = {
    createCategotyValidationSchema,
    updateCategotyValidationSchema,
};
