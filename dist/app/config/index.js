"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_secret: process.env.JWT_ACCESS_SECRET,
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    nodemailer_host: process.env.NODEMAILER_HOST,
    nodemailer_sender: process.env.NODEMAILER_SENDER,
    nodemailer_password: process.env.NODEMAILER_Password,
    STORE_ID: process.env.STORE_ID,
    SIGNATURE_KEY: process.env.SIGNATURE_KEY,
    PAYMENT_URL: process.env.PAYMENT_URL,
    PAYMENT_Check_URL: process.env.PAYMENT_Check_URL,
};
