"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const review_controller_1 = require("./review.controller");
const router = (0, express_1.Router)();
// ! for getting all review
router.get("/all-review", review_controller_1.reviewController.getAllReview);
// ! for getting recent 3 reviews
router.get("/recent-review", review_controller_1.reviewController.getRecentReview);
// ! for checking eligibility for review
router.get("/check-eligible-for-review/:id", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), review_controller_1.reviewController.checkEligibleForReview);
// ! for getting vendor prosuct review
router.get("/getVendorProductReviews", (0, validateUser_1.default)(client_1.UserRole.VENDOR), review_controller_1.reviewController.getVendorProductReviews);
// ! add review
router.post("/give-review", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), review_controller_1.reviewController.addReview);
// ! updating review
router.patch("/update-review", review_controller_1.reviewController.updateReview);
//
exports.reviewRouter = router;
