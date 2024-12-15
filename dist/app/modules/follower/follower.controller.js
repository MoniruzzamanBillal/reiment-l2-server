"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followerController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../util/catchAsync"));
const sendResponse_1 = __importDefault(require("../../util/sendResponse"));
const follower_service_1 = require("./follower.service");
// ! get logged in user follower data
const getLoggedUserData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield follower_service_1.followerService.getLoggedUserFollowShop((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Logged In user follower data retrived successfully!!!",
        data: result,
    });
}));
// ! for following a shop
const followShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const result = yield follower_service_1.followerService.followShop((_b = req.body) === null || _b === void 0 ? void 0 : _b.shopId, (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Followed to shop successfully!!!",
        data: result,
    });
}));
// ! for unfollowing a shop
const unfollowShop = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const result = yield follower_service_1.followerService.unfollowShop((_d = req.body) === null || _d === void 0 ? void 0 : _d.shopId, (_e = req.user) === null || _e === void 0 ? void 0 : _e.userId);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "UnFollowed to shop successfully!!!",
        data: result,
    });
}));
//
exports.followerController = {
    followShop,
    unfollowShop,
    getLoggedUserData,
};
