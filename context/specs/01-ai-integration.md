# 01: AI Integration

Status: ✅ Complete. Full delivered plan lives in root `implementationplan.md` — this is a condensed summary, not a replacement for it.

## Goal

Add three AI-assisted endpoints (vendor product-description generation, a public shopping chat, and public smart search) without introducing a second way to call an LLM or trust its output for writes.

## Design

- One shared client, `askOpenRouter` (`src/app/util/openRouterClient.ts`), tries a fallback list of free OpenRouter models in order and throws `AppError` if all fail. Every AI endpoint goes through it — no direct OpenRouter/`openai` client calls from a service.
- New `ai` module (`src/app/modules/ai/`) follows the standard route/controller/service/validation/interface split, minus a model file (no dedicated table — stateless per request).
- Public endpoints (`chat`, `smart-search`) get a route-local `express-rate-limit` (10 req/min/IP) to protect the free quota, not a global limiter.
- Model output is never trusted directly for a write: smart-search's JSON is Zod-validated and only used as a read filter; chat's `productIds` are only used to re-fetch real products via existing product endpoints.

## Implementation

1. `ai.route.ts` — `POST /generate-description` (`validateUser(UserRole.VENDOR)`), `POST /chat` (public, rate-limited), `POST /smart-search` (public, rate-limited).
2. `ai.validation.ts` — Zod schemas for each request body.
3. `ai.service.ts` — builds prompts, calls `askOpenRouter`, validates/parses JSON output where relevant.
4. `ai.controller.ts` — thin `catchAsync` wrappers calling the service, responding via `sendResponse`.
5. Registered `/ai` in `src/app/router/index.ts`.

## Dependencies

None (self-contained module) beyond `config.openRouterApiKey`.

## Verify

- `yarn build` + `yarn lint` clean.
- `POST /api/ai/generate-description` requires a vendor JWT and returns a title/description draft.
- `POST /api/ai/chat` and `POST /api/ai/smart-search` work without auth and are rate-limited past 10 req/min/IP.
- Smart-search's returned filter is validated (a malformed/hallucinated model response degrades gracefully, doesn't 500 or write anything).
