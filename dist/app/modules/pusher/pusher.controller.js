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
exports.pusherController = void 0;
const catchAsync_1 = __importDefault(require("../../util/catchAsync"));
const pusher_service_1 = require("./pusher.service");
// ! for authorizing a pusher private channel subscription
// note: responds with the raw pusher auth payload, not the app's sendResponse
// envelope — pusher-js's client requires the exact `{ auth: "..." }` shape
const authorizeChannel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { socket_id, channel_name } = req.body;
    const authResponse = yield pusher_service_1.pusherServices.authorizeChannel(socket_id, channel_name, req.user);
    res.status(200).send(authResponse);
}));
//
exports.pusherController = {
    authorizeChannel,
};
