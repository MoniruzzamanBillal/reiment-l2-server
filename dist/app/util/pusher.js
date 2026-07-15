"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pusher_1 = __importDefault(require("pusher"));
const config_1 = __importDefault(require("../config"));
const pusherServer = new pusher_1.default({
    appId: config_1.default.PUSHER_APP_ID,
    key: config_1.default.PUSHER_KEY,
    secret: config_1.default.PUSHER_SECRET,
    cluster: config_1.default.PUSHER_CLUSTER,
    useTLS: true,
});
exports.default = pusherServer;
