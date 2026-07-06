"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const ai_controller_1 = require("./ai.controller");
const ai_validation_1 = require("./ai.validation");
const router = (0, express_1.Router)();
// ! protects the free openrouter quota on the public endpoints from abuse
const aiPublicRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many AI requests, please try again in a minute.",
    },
});
// ! for generating a product description draft (vendor only)
router.post("/generate-description", (0, validateUser_1.default)(client_1.UserRole.VENDOR), (0, validateRequest_1.default)(ai_validation_1.aiValidations.generateDescriptionValidationSchema), ai_controller_1.aiController.generateDescription);
// ! for chatting with the shopping assistant
router.post("/chat", aiPublicRateLimiter, (0, validateRequest_1.default)(ai_validation_1.aiValidations.chatValidationSchema), ai_controller_1.aiController.chat);
// ! for natural language product search
router.post("/smart-search", aiPublicRateLimiter, (0, validateRequest_1.default)(ai_validation_1.aiValidations.smartSearchValidationSchema), ai_controller_1.aiController.smartSearch);
//
exports.aiRouter = router;
