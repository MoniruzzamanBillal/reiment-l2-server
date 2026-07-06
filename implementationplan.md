# AI Integration Plan — OpenRouter (Free Models)

Scope: 3 features on top of the existing Express + Prisma backend, following the
module conventions already used by `product`, `shop`, etc. (route → validation →
controller → service, wrapped with `catchAsync` / `sendResponse` / `AppError`).

1. Vendor product description generator
2. Customer shopping assistant (chatbot)
3. Smart search / natural-language query understanding

All three share **one** reusable OpenRouter client. No new runtime dependency is
required — OpenRouter's API is OpenAI-compatible over plain HTTPS, and `axios` is
already installed.

---

## 1. How OpenRouter fits in

- Endpoint: `POST https://openrouter.ai/api/v1/chat/completions` — same shape as
  OpenAI's chat completions API.
- Auth: `Authorization: Bearer <OPENROUTER_API_KEY>`.
- Free models are suffixed `:free` (e.g. `meta-llama/llama-3.3-70b-instruct:free`,
  `deepseek/deepseek-chat-v3.1:free`, `qwen/qwen-2.5-72b-instruct:free`). They carry
  low per-minute/per-day rate limits and can occasionally 429 or be temporarily
  unavailable — the client must **try a short fallback list**, not a single model.
- Optional but recommended headers for free-tier routing/attribution:
  `HTTP-Referer: <your site url>`, `X-Title: <your app name>`.
- Never call OpenRouter from the frontend — the key must stay server-side. The
  client repo only ever talks to `/api/ai/*` on this backend.

---

## 2. New module: `src/app/modules/ai/`

Mirrors the existing `products` module layout:

```
src/app/modules/ai/
  ai.interface.ts     # shared TS types for payloads
  ai.validation.ts     # zod schemas
  ai.controller.ts     # catchAsync + sendResponse, one fn per route
  ai.service.ts         # business logic, talks to prisma + the OpenRouter client
  ai.route.ts           # express Router
```

Plus one cross-cutting util (same tier as `sendEmail.ts`, `SendImageCloudinary.ts`):

```
src/app/util/openRouterClient.ts   # the reusable "ask the model" function
```

Register it in `src/app/router/index.ts` next to the other modules:

```ts
import { aiRouter } from "../modules/ai/ai.route";
// ...
{ path: "/ai", route: aiRouter },
```

---

## 3. Config & environment variables

Add to `.env`:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
OPENROUTER_SITE_URL=https://reimentl2.vercel.app
OPENROUTER_SITE_NAME=Reiment
```

Add to `src/app/config/index.ts`:

```ts
openrouter_api_key: process.env.OPENROUTER_API_KEY,
openrouter_site_url: process.env.OPENROUTER_SITE_URL,
openrouter_site_name: process.env.OPENROUTER_SITE_NAME,
```

---

## 4. Shared client — `src/app/util/openRouterClient.ts`

This is the single choke point every feature calls through. It hides model
fallback, headers, and error handling so `ai.service.ts` never talks to axios
directly.

```ts
export type TChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AskOptions = {
  jsonMode?: boolean; // ask the model to return raw JSON only
  temperature?: number;
};

// tries each model in order until one responds; throws AppError if all fail
export const askOpenRouter = async (
  messages: TChatMessage[],
  options?: AskOptions,
): Promise<string> => {
  /* axios.post per FREE_MODELS entry, catch 429/5xx -> next */
};
```

Fallback list (kept as a local const, easy to edit as OpenRouter's free catalog
changes — check `https://openrouter.ai/models?max_price=0` periodically):

```ts
const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-chat-v3.1:free",
  "qwen/qwen-2.5-72b-instruct:free",
];
```

Behavior:

- POST to `/chat/completions` with `{ model, messages, temperature, response_format }`.
- On `429` or `5xx` → try the next model in `FREE_MODELS`. On network/timeout → same.
- Set an axios timeout (e.g. 20s) so one dead model doesn't stall the request.
- If every model fails → `throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "AI service is busy, try again shortly")`.
- Return just the message string (`response.data.choices[0].message.content`).

---

## 5. Feature 1 — Vendor product description generator

**Route:** `POST /api/ai/generate-description` (role: `VENDOR`, reuses `validateUser`)

**Request body** (`ai.validation.ts` → `generateDescriptionValidationSchema`):

```ts
{ name: string; categoryId: string; keywords?: string; price?: number }
```

**Service — `generateProductDescription`:**

1. Look up the category name via `prisma.categories.findUnique` (gives the model
   real context instead of a raw UUID).
2. Build a prompt instructing the model to return **strict JSON**:
   `{ "title": string, "description": string }`.
3. Call `askOpenRouter(messages, { jsonMode: true })`.
4. `JSON.parse` the result; on parse failure, retry once with a stricter
   "return ONLY JSON" reminder message before giving up.

**Response:** `{ title, description }` — the vendor sees it in a preview box on
the frontend "Add Product" form and can edit before hitting the existing
`addProduct` submit. This endpoint **does not** touch `prisma.products` — it only
drafts text; the existing `product.service.ts::addProduct` flow is unchanged.

---

## 6. Feature 2 — Customer shopping assistant (chatbot)

**Route:** `POST /api/ai/chat` (public — logged-out visitors can use it too)

**Request body:**

```ts
{ message: string; history?: TChatMessage[] }  // client keeps and resends history
```

Kept **stateless** on the server on purpose — no new `ChatMessage` Prisma model,
no session storage. The client array is capped (e.g. last 10 turns) before it's
sent back, so the server just forwards it.

**Service — `chatWithAssistant`:**

1. Fetch a small, cheap grounding set from the DB — reuse the shape from
   `productServices.getAllProducts`, but only pull
   `{ id, name, price, discount, category: { name } }` for ~15–20 active products
   (optionally filtered by keywords extracted from `message` via the existing
   `productSearchableFields` search, same as normal search).
2. Build a system prompt that:
   - States the assistant is a shopping assistant for this marketplace.
   - Includes the product snippet as a compact list (`id | name | price | category`).
   - Explicitly forbids inventing products/prices not in the list.
   - Instructs the model to end its reply with a fenced block
     ` ```json {"productIds": ["..."]} ``` ` listing any products it mentioned —
     this lets the frontend render real product cards without a second model call.
3. Call `askOpenRouter([system, ...history, {role:"user", content: message}])`.
4. Strip the trailing `json` block out of the text with a regex, `JSON.parse`
   it (default to `{ productIds: [] }` if missing/invalid), and return:
   ```ts
   { reply: string, productIds: string[] }
   ```
5. Controller/frontend can then fetch full product docs via the existing
   `GET /api/product/get-product/:id` for any `productIds` returned, to render cards.

---

## 7. Feature 3 — Smart search / query understanding

**Route:** `POST /api/ai/smart-search` (public)

**Request body:** `{ query: string }` e.g. `"cheap waterproof shoes under $50"`.

**Service — `parseSmartSearch`:**

1. Fetch the category list (`id`, `name`) from `prisma.categories` — small table,
   cheap to send in full.
2. Prompt the model to output **strict JSON** matching the existing filter shape
   consumed by `productServices.getAllProducts`:
   ```ts
   { searchTerm?: string; categoryId?: string; priceRange?: number }
   ```
   with the category list included in the prompt so the model can only pick a
   real `categoryId`, never invent one.
3. `askOpenRouter(messages, { jsonMode: true })`, parse the JSON, then validate it
   with a zod schema (`smartSearchFilterSchema`) — if parsing/validation fails,
   **fall back** to `{ searchTerm: query }` so search never hard-fails because the
   model misbehaved.
4. Delegate straight to the existing `productServices.getAllProducts(options, filter)`
   — no duplicated pagination/query logic. `options` (page/limit/sort) come from
   `req.query` exactly like the normal `/product/all-products` route.

**Response:** identical shape to `GET /api/product/all-products` (`{ data, meta }`),
so the frontend product-list component needs zero changes to consume it.

---

## 8. Cross-cutting concerns

- **Rate limiting the free quota.** `/chat` and `/smart-search` are public and
  hit the free model tier — add `express-rate-limit` (new dependency) scoped to
  the `aiRouter` only, e.g. 10 requests/minute per IP, to stop one abusive client
  from burning the whole app's daily OpenRouter quota.
- **Prompt-injection guardrails.** Product names/descriptions are vendor-supplied
  text that ends up inside prompts (chat grounding, description generator). Treat
  it as untrusted: keep system instructions separate from injected data, and
  never let model output directly drive a DB write — smart-search's JSON is
  zod-validated and only ever used as a **read** filter; chat's `productIds` are
  only used to re-fetch real products, never trusted for prices/content.
- **Timeouts & fallback list.** Every call goes through `askOpenRouter`, so
  timeout/retry/model-fallback logic lives in one place.
- **Errors surfaced to the client.** All failures bubble up as `AppError` →
  existing `globalErrorHandler` → the standard `{ success: false, message }` shape
  the frontend already knows how to render.
- **No new Prisma models needed** for the initial version (stateless chat,
  no logging table). If you later want analytics/history, add a `ChatLog` model
  as a separate follow-up.

---

## 9. New files checklist

| File                                  | Purpose                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `src/app/util/openRouterClient.ts`    | reusable `askOpenRouter()` with model fallback                          |
| `src/app/modules/ai/ai.interface.ts`  | payload/response types                                                  |
| `src/app/modules/ai/ai.validation.ts` | zod schemas for the 3 endpoints                                         |
| `src/app/modules/ai/ai.service.ts`    | `generateProductDescription`, `chatWithAssistant`, `parseSmartSearch`   |
| `src/app/modules/ai/ai.controller.ts` | `catchAsync` handlers calling the services                              |
| `src/app/modules/ai/ai.route.ts`      | wires validation + `validateUser(VENDOR)` where needed                  |
| `src/app/router/index.ts` (edit)      | register `{ path: "/ai", route: aiRouter }`                             |
| `src/app/config/index.ts` (edit)      | add the 3 `openrouter_*` config keys                                    |
| `.env` (edit)                         | add `OPENROUTER_API_KEY`, `OPENROUTER_SITE_URL`, `OPENROUTER_SITE_NAME` |
| `package.json` (edit)                 | add `express-rate-limit`                                                |

---

## 10. Testing plan (curl)

```bash
# 1. description generator (needs a vendor JWT)
curl -X POST http://localhost:5000/api/ai/generate-description \
  -H "Authorization: Bearer <vendor_token>" -H "Content-Type: application/json" \
  -d '{"name":"Running Shoes","categoryId":"<catId>","keywords":"lightweight, waterproof, breathable"}'

# 2. chatbot
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Suggest a waterproof shoe under $50"}'

# 3. smart search
curl -X POST http://localhost:5000/api/ai/smart-search \
  -H "Content-Type: application/json" \
  -d '{"query":"cheap waterproof shoes under $50"}'
```

---

## 11. Frontend touch points (reiment-l2-client) — for later, not part of this backend plan

- Add-product form: a "Generate with AI" button calling `/api/ai/generate-description`,
  filling the title/description fields (still editable, still submitted through
  the existing add-product flow).
- A floating chat widget calling `/api/ai/chat`, rendering `reply` as text and
  `productIds` as product cards (fetched via the existing single-product endpoint).
- Search bar: optionally route free-text queries through `/api/ai/smart-search`
  instead of (or in addition to) the current `searchTerm` query param.

---

## 12. Implementation order

1. `openRouterClient.ts` + config/env — get one raw prompt round-tripping (verify
   with a throwaway `/api/ai/ping` route, remove after).
2. Smart search (lowest risk — read-only, falls back to plain search on any failure).
3. Product description generator (single vendor-gated endpoint, no grounding data needed).
4. Chatbot (most moving parts — grounding query + structured extraction from the reply).
5. Add `express-rate-limit` to `/chat` and `/smart-search` once the happy path works.
