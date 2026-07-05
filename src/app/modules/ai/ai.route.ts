import { UserRole } from "@prisma/client";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import validateRequest from "../../middleware/validateRequest";
import validateUser from "../../middleware/validateUser";
import { aiController } from "./ai.controller";
import { aiValidations } from "./ai.validation";

const router = Router();

// ! protects the free openrouter quota on the public endpoints from abuse
const aiPublicRateLimiter = rateLimit({
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
router.post(
  "/generate-description",
  validateUser(UserRole.VENDOR),
  validateRequest(aiValidations.generateDescriptionValidationSchema),
  aiController.generateDescription
);

// ! for chatting with the shopping assistant
router.post(
  "/chat",
  aiPublicRateLimiter,
  validateRequest(aiValidations.chatValidationSchema),
  aiController.chat
);

// ! for natural language product search
router.post(
  "/smart-search",
  aiPublicRateLimiter,
  validateRequest(aiValidations.smartSearchValidationSchema),
  aiController.smartSearch
);

//
export const aiRouter = router;
