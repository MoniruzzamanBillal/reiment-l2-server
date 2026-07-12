# Architecture

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| **Runtime/Framework** | Node.js + Express 4 | HTTP server and routing. |
| **Language** | TypeScript | Static typing across routes/services/controllers. |
| **Database** | PostgreSQL via Prisma (`@prisma/client`, `@prisma/adapter-neon`) | Persistence for all domain models (`prisma/schema.prisma`). |
| **Auth** | `jsonwebtoken` + `argon2` | Access-token issuance/verification (`config.jwt_secret`); `argon2` for password hashing (the `bcrypt` dependency is present but unused — its import is commented out in `auth.service.ts`). |
| **Validation** | Zod | Request-body schema validation via `validateRequest`. |
| **File Upload** | Multer + Cloudinary (`SendImageCloudinary.ts`) | Shop/product images. |
| **Payments** | SSLCOMMERZ-style flow | `src/app/modules/payment/`. |
| **AI** | OpenRouter (via `askOpenRouter`, using the `openai` SDK client under the hood) | Product description generation, shopping chat, smart search. |
| **Rate limiting** | `express-rate-limit` | Scoped locally per-route (not global) — see AI module below. |
| **Email** | Nodemailer | Transactional email (`src/app/util/sendEmail.ts`). |

## System Boundaries

- `src/server.ts` — process entry point.
- `src/app.ts` — Express app composition, in order: `express.json()` → CORS (explicit origin allowlist: `localhost:3000`, `localhost:5173`, the deployed client domains) → `morgan("dev")` → `cookieParser()` → `body-parser` urlencoded → `MainRouter` mounted at `/api` → root `GET /` health check → `globalErrorHandler` → catch-all 404 handler. This order matters — the error handler must come after routes and before the 404 handler.
- `src/app/router/index.ts` — a flat `routeArray` of `{ path, route }`, mounted under `/api`: `/test`, `/auth`, `/admin`, `/user`, `/category`, `/shop`, `/product`, `/cart`, `/order`, `/payment`, `/address`, `/review`, `/follow`, `/coupon`, `/ai`.
- `src/app/modules/<name>/` — one directory per domain resource: `address`, `admin`, `ai`, `auth`, `boilerModule`, `cart`, `category`, `coupon`, `follower`, `order`, `payment`, `products`, `review`, `shop`, `user`. Every feature module follows the same five-file convention:
  - `<name>.route.ts` — Express Router; wires middleware → validation → controller.
  - `<name>.controller.ts` — `catchAsync(...)` wrapper per handler; calls service, calls `sendResponse`.
  - `<name>.service.ts` — business logic; talks to Prisma directly.
  - `<name>.validation.ts` — Zod schemas, consumed by `validateRequest`.
  - `<name>.interface.ts` — shared TS types for the module's payloads/results.
  - `boilerModule` (mounted at `/test`) and `payment` are pre-existing exceptions that don't fully follow this five-file convention — don't copy their shape for new modules.
  - `ai` has no `.model.ts` (there's no Prisma model for it — no dedicated table); it's stateless per request, going through `askOpenRouter` and either returning directly (chat) or Zod-validating the model's JSON output before using it as a read filter (smart-search).
- `src/app/middleware/` — `catchAsync.ts` equivalent lives in `util/`; middleware itself is `validateUser.ts`, `validateRequest.ts`, `globalErrorHandler.ts`.
- `src/app/util/` — `catchAsync.ts`, `sendResponse.ts`, `prisma.ts` (the singleton client), `pick.ts`, `paginationHelper.ts`, `openRouterClient.ts` (the shared `askOpenRouter` fallback client), `sendEmail.ts`, `SendImageCloudinary.ts`.
- `src/app/Error/` — `AppError.ts` plus normalizers (`handleZodError.ts`, `handleValidationError.ts`, `handleDuplicateError.ts`, `handleCatError.ts`) consumed by `globalErrorHandler`.
- `src/app/config/index.ts` — the single place `process.env` is read (DB URL, JWT secret, Cloudinary, Nodemailer, SSLCOMMERZ credentials, `openRouterApiKey`). New code should import `config` rather than reading `process.env` directly.

## Data Model (Prisma, PostgreSQL)

Core models in `prisma/schema.prisma`: `User` (role: `ADMIN`/`VENDOR`/`CUSTOMER`) → `Shop` (1:1 with vendor) → `Products` → `Categories`; `Cart`/`CartItem`, `Order`/`OrderItem`, `Review`, `Address`, `Follower`, `Coupon`, `CouponUsage`. Enums: `UserRole`, `UserStatus`, `ShopStatus`, `OrderStatus`. Soft-deletes are used throughout (`isDelated: Boolean`, note the field is misspelled consistently on some models — match the existing spelling, don't "fix" it) instead of hard deletes.

## Auth & Access Model

- Users authenticate via `POST /api/auth/login`, receiving a JWT signed with `config.jwt_secret` containing at least `userId` and `userRole`.
- `validateUser(...requiredRoles: UserRole[])` (`src/app/middleware/validateUser.ts`) decodes the `Authorization: Bearer <token>` header, checks `userRole` against the allowed roles, and attaches `req.user`. Called with no roles to require *any* authenticated user, or specific `UserRole` values to restrict a route.
- Rate limiting for the AI module's public endpoints (`/ai/chat`, `/ai/smart-search`) uses `express-rate-limit` scoped locally inside `ai.route.ts` (10 req/min/IP) to protect the free OpenRouter quota — follow this pattern (route-local limiter, not global) if adding other public/abuse-prone endpoints.

## Invariants

1. **Response envelope:** every controller responds via `sendResponse(res, { status, success, message, data, token? })` (`src/app/util/sendResponse.ts`) — don't hand-roll `res.json(...)` in new controllers.
2. **Async error propagation:** every async Express handler (route middleware and controllers alike) is wrapped in `catchAsync` so thrown errors reach `next(error)` instead of crashing.
3. **Validation before controller:** any route accepting a body goes through `validateRequest(schema)` before the controller runs.
4. **Errors are thrown, not hand-rolled:** use `new AppError(statusCode, message)` — caught by `globalErrorHandler`, which also special-cases Zod, Prisma duplicate-key, and Prisma validation errors.
5. **Config centralization:** all environment variables are read once in `src/app/config/index.ts` and imported from there.
6. **Module self-containment:** a new domain resource gets its own `src/app/modules/<name>/` directory following the five-file split above, registered in `src/app/router/index.ts` — don't bolt unrelated logic onto an existing module.
7. **`prisma` singleton** (`src/app/util/prisma.ts`) — import it rather than instantiating `PrismaClient` elsewhere.
8. **Never call OpenRouter directly from a service** — always go through `askOpenRouter`, and never trust model output that could drive a DB write without validating/re-fetching real data first.
9. **This is one half of a two-repo product.** Never assume `reiment-l2-client` shares code, types, or version control with this repo — a cross-cutting change is always two separate edits, each verified in its own repo.
