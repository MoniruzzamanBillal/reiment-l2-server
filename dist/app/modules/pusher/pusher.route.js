"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pusherRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const pusher_controller_1 = require("./pusher.controller");
const router = (0, express_1.Router)();
// ! for authorizing private channel subscriptions (any authenticated user)
router.post("/auth", (0, validateUser_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.VENDOR, client_1.UserRole.CUSTOMER), pusher_controller_1.pusherController.authorizeChannel);
//
exports.pusherRouter = router;
