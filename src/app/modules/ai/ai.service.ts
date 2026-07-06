import httpStatus from "http-status";
import AppError from "../../Error/AppError";
import { askOpenRouter, TChatMessage } from "../../util/openRouterClient";
import prisma from "../../util/prisma";
import { productSearchableFields } from "../products/product.constants";
import {
  TChatPayload,
  TChatResult,
  TGenerateDescriptionPayload,
  TGenerateDescriptionResult,
  TSmartSearchFilter,
} from "./ai.interface";

// ! models sometimes wrap json in prose/markdown despite instructions - pull the object out
const extractJson = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

// ! for drafting a product title + description for a vendor
const generateProductDescription = async (
  payload: TGenerateDescriptionPayload,
): Promise<TGenerateDescriptionResult> => {
  const categoryData = await prisma.categories.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category don't exist!!!");
  }

  const messages: TChatMessage[] = [
    {
      role: "system",
      content:
        "You are an ecommerce copywriter. Given a product name, category, keywords and price, write a short, appealing product title and a 2-4 sentence description. " +
        'Respond with ONLY valid JSON in this exact shape, no markdown, no extra text: {"title": string, "description": string}',
    },
    {
      role: "user",
      content: `Name: ${payload.name}\nCategory: ${categoryData.name}\nKeywords: ${
        payload.keywords ?? "N/A"
      }\nPrice: ${payload.price ?? "N/A"}`,
    },
  ];

  const raw = await askOpenRouter(messages, {
    jsonMode: true,
    temperature: 0.8,
  });

  try {
    const parsed = JSON.parse(extractJson(raw));

    if (!parsed?.title || !parsed?.description) {
      throw new Error("Missing fields in AI response");
    }

    return { title: parsed.title, description: parsed.description };
  } catch {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "AI returned an unexpected response, please try again",
    );
  }
};

// ! for grounding + answering a customer chat message
const chatWithAssistant = async (
  payload: TChatPayload,
): Promise<TChatResult> => {
  const keywords = payload.message
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 6);

  const searchConditions = keywords.flatMap((word) =>
    productSearchableFields.map((field) => ({
      [field]: { contains: word, mode: "insensitive" as const },
    })),
  );

  const candidateProducts = await prisma.products.findMany({
    where: {
      isDelated: false,
      ...(searchConditions.length ? { OR: searchConditions } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const catalogSnippet = candidateProducts
    .map(
      (product) =>
        `${product.id} | ${product.name} | $${product.price}${
          product.discount ? ` (${product.discount}% off)` : ""
        } | ${product.category.name}`,
    )
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

  const messages: TChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...(payload.history ?? []),
    { role: "user", content: payload.message },
  ];

  const raw = await askOpenRouter(messages, { temperature: 0.6 });

  const jsonBlockMatch = raw.match(/```json\s*([\s\S]*?)```/i);
  let productIds: string[] = [];

  if (jsonBlockMatch) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      productIds = Array.isArray(parsed?.productIds) ? parsed.productIds : [];
    } catch {
      productIds = [];
    }
  }

  const reply = raw.replace(/```json\s*[\s\S]*?```/i, "").trim();

  return { reply, productIds };
};

// ! for turning a natural language query into a structured product filter
const parseSmartSearchQuery = async (
  query: string,
): Promise<TSmartSearchFilter> => {
  const categories = await prisma.categories.findMany({
    where: { isDelated: false },
    select: { id: true, name: true },
  });

  const categoryList = categories.map((c) => `${c.id} = ${c.name}`).join("\n");

  const messages: TChatMessage[] = [
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
    const raw = await askOpenRouter(messages, {
      jsonMode: true,
      temperature: 0.2,
    });
    const parsed = JSON.parse(extractJson(raw));

    const filter: TSmartSearchFilter = {};

    if (typeof parsed?.searchTerm === "string" && parsed.searchTerm.trim()) {
      filter.searchTerm = parsed.searchTerm.trim();
    }

    if (
      typeof parsed?.categoryId === "string" &&
      categories.some((category) => category.id === parsed.categoryId)
    ) {
      filter.categoryId = parsed.categoryId;
    }

    if (typeof parsed?.priceRange === "number" && parsed.priceRange > 0) {
      filter.priceRange = parsed.priceRange;
    }

    return Object.keys(filter).length ? filter : { searchTerm: query };
  } catch {
    // ! if the model misbehaves, fall back to a plain search rather than failing the request
    return { searchTerm: query };
  }
};

//
export const aiServices = {
  generateProductDescription,
  chatWithAssistant,
  parseSmartSearchQuery,
};
