"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopValidationsSchemas = void 0;
const zod_1 = require("zod");
// ! for crating a shop
const crateShopValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        description: zod_1.z.string().min(1, "Description is required"),
    }),
});
//
exports.shopValidationsSchemas = {
    crateShopValidationSchema,
};
