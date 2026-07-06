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
exports.aiServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../Error/AppError"));
const prisma_1 = __importDefault(require("../../util/prisma"));
const openRouterClient_1 = require("../../util/openRouterClient");
const product_constants_1 = require("../products/product.constants");
// ! models sometimes wrap json in prose/markdown despite instructions - pull the object out
const extractJson = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
};
// ! for drafting a product title + description for a vendor
const generateProductDescription = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const categoryData = yield prisma_1.default.categories.findUnique({
        where: { id: payload.categoryId },
    });
    if (!categoryData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Category don't exist!!!");
    }
    const messages = [
        {
            role: "system",
            content: "You are an ecommerce copywriter. Given a product name, category, keywords and price, write a short, appealing product title and a 2-4 sentence description. " +
                'Respond with ONLY valid JSON in this exact shape, no markdown, no extra text: {"title": string, "description": string}',
        },
        {
            role: "user",
            content: `Name: ${payload.name}\nCategory: ${categoryData.name}\nKeywords: ${(_a = payload.keywords) !== null && _a !== void 0 ? _a : "N/A"}\nPrice: ${(_b = payload.price) !== null && _b !== void 0 ? _b : "N/A"}`,
        },
    ];
    const raw = yield (0, openRouterClient_1.askOpenRouter)(messages, { jsonMode: true, temperature: 0.8 });
    try {
        const parsed = JSON.parse(extractJson(raw));
        if (!(parsed === null || parsed === void 0 ? void 0 : parsed.title) || !(parsed === null || parsed === void 0 ? void 0 : parsed.description)) {
            throw new Error("Missing fields in AI response");
        }
        return { title: parsed.title, description: parsed.description };
    }
    catch (_c) {
        throw new AppError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "AI returned an unexpected response, please try again");
    }
});
// ! for grounding + answering a customer chat message
const chatWithAssistant = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const keywords = payload.message
        .split(/\s+/)
        .filter((word) => word.length > 2)
        .slice(0, 6);
    const searchConditions = keywords.flatMap((word) => product_constants_1.productSearchableFields.map((field) => ({
        [field]: { contains: word, mode: "insensitive" },
    })));
    const candidateProducts = yield prisma_1.default.products.findMany({
        where: Object.assign({ isDelated: false }, (searchConditions.length ? { OR: searchConditions } : {})),
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 15,
    });
    const catalogSnippet = candidateProducts
        .map((product) => `${product.id} | ${product.name} | $${product.price}${product.discount ? ` (${product.discount}% off)` : ""} | ${product.category.name}`)
        .join("\n");
    const systemPrompt = `You are a helpful shopping assistant for an online marketplace.
Only recommend products from the catalog list below - never invent products, prices, or availability.
If nothing in the catalog fits, say so honestly.

Catalog (id | name | price | category):
${catalogSnippet || "No matching products found."}

After your reply, on a new line, output a fenced json block listing the ids of any products you mentioned, like:
\`\`\`json
{"productIds": ["id1", "id2"]}
\`\`\`
If you mentioned no products, output {"productIds": []}.`;
    const messages = [
        { role: "system", content: systemPrompt },
        ...((_a = payload.history) !== null && _a !== void 0 ? _a : []),
        { role: "user", content: payload.message },
    ];
    const raw = yield (0, openRouterClient_1.askOpenRouter)(messages, { temperature: 0.6 });
    const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)```/i);
    let productIds = [];
    if (jsonBlockMatch) {
        try {
            const parsed = JSON.parse(jsonBlockMatch[1].trim());
            productIds = Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.productIds) ? parsed.productIds : [];
        }
        catch (_b) {
            productIds = [];
        }
    }
    const reply = raw.replace(/```json\s*[\s\S]*?```/i, "").trim();
    return { reply, productIds };
});
// ! for turning a natural language query into a structured product filter
const parseSmartSearchQuery = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield prisma_1.default.categories.findMany({
        where: { isDelated: false },
        select: { id: true, name: true },
    });
    const categoryList = categories.map((c) => `${c.id} = ${c.name}`).join("\n");
    const messages = [
        {
            role: "system",
            content: `You turn a shopper's natural language search into a JSON filter for a product search API.
Available categories (id = name):
${categoryList || "No categories available."}

Respond with ONLY valid JSON in this exact shape, no markdown, no extra text:
{"searchTerm": string | null, "categoryId": string | null, "priceRange": number | null}

Rules:
- "searchTerm" should be the core product keywords (e.g. "waterproof shoes"), or null if none.
- "categoryId" must be one of the ids listed above, or null if no category matches.
- "priceRange" is the maximum price mentioned (e.g. "under $50" -> 50), or null if no price mentioned.`,
        },
        { role: "user", content: query },
    ];
    try {
        const raw = yield (0, openRouterClient_1.askOpenRouter)(messages, { jsonMode: true, temperature: 0.2 });
        const parsed = JSON.parse(extractJson(raw));
        const filter = {};
        if (typeof (parsed === null || parsed === void 0 ? void 0 : parsed.searchTerm) === "string" && parsed.searchTerm.trim()) {
            filter.searchTerm = parsed.searchTerm.trim();
        }
        if (typeof (parsed === null || parsed === void 0 ? void 0 : parsed.categoryId) === "string" &&
            categories.some((category) => category.id === parsed.categoryId)) {
            filter.categoryId = parsed.categoryId;
        }
        if (typeof (parsed === null || parsed === void 0 ? void 0 : parsed.priceRange) === "number" && parsed.priceRange > 0) {
            filter.priceRange = parsed.priceRange;
        }
        return Object.keys(filter).length ? filter : { searchTerm: query };
    }
    catch (_a) {
        // ! if the model misbehaves, fall back to a plain search rather than failing the request
        return { searchTerm: query };
    }
});
//
exports.aiServices = {
    generateProductDescription,
    chatWithAssistant,
    parseSmartSearchQuery,
};
