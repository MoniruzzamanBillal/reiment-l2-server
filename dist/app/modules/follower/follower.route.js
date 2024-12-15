"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followerRouter = void 0;
const express_1 = require("express");
const follower_controller_1 = require("./follower.controller");
const validateUser_1 = __importDefault(require("../../middleware/validateUser"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ! for getting logged in user follower data
router.get("/logged-user-data", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), follower_controller_1.followerController.getLoggedUserData);
// ! for following a shop
router.post("/follow-shop", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), follower_controller_1.followerController.followShop);
// ! for unfollowing a shop
router.delete("/unfollow-shop", (0, validateUser_1.default)(client_1.UserRole.CUSTOMER), follower_controller_1.followerController.unfollowShop);
//
exports.followerRouter = router;
