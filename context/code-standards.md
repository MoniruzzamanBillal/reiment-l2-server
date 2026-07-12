# Code Standards

## TypeScript Conventions

- Domain types are plain `type` aliases (e.g. `TFollower`, `TCoupon`) — not interfaces, not `I`-prefixed. Follow this existing convention for new domain types.
- Prisma-generated enums (`UserRole`, `OrderStatus`, `ShopStatus`, `UserStatus`) are imported from `@prisma/client` rather than redefined — reuse them, don't create parallel string-literal unions for the same value set.
- `any`/`eslint-disable` appears at true error/boundary catch sites (e.g. `globalErrorHandler`) — acceptable there, not for domain data.

## File Organization & Naming

- One directory per resource under `src/app/modules/<name>/`, files named `<name>.<layer>.ts`: `route`, `controller`, `service`, `validation`, `interface`. Follow this exact five-file shape for new modules — `boilerModule` and `payment` are pre-existing exceptions, not a pattern to copy.
- New modules are registered in `src/app/router/index.ts`'s flat `routeArray`.
- Cross-cutting code lives in `src/app/middleware/`, `src/app/util/`, `src/app/Error/`, `src/app/config/`.

## Request/Response Conventions

- Controllers are thin: call the service, then `sendResponse(res, { status, success, message, data })`. Business logic and Prisma queries belong in the service, not the controller.
- Errors are thrown as `new AppError(httpStatus.<CODE>, "message")` and caught by `globalErrorHandler` — don't `res.status(...).json(...)` an error directly from inside a service/controller.
- Use the `http-status` package's named constants (`httpStatus.UNAUTHORIZED`, etc.) instead of raw numbers.

## Validation

- Request bodies are validated with Zod schemas in `*.validation.ts`, applied via the `validateRequest` middleware in the route definition — validation lives in the route chain, not inside the controller/service.

## Database

- Talk to Postgres only through the `prisma` singleton (`src/app/util/prisma.ts`) — never instantiate a second `PrismaClient`.
- Soft-delete via the existing boolean flags (`isDelated`/`isDeleted`, spelling varies by model — match whichever the model you're editing already uses) — never a hard `.delete()` on a domain record that's meant to be recoverable/auditable.
- After editing `prisma/schema.prisma`: `npx prisma migrate dev --name <name>`, then `npx prisma generate` (also runs automatically on `postinstall`).

## AI Module Conventions

- Route all AI calls through `askOpenRouter` (`src/app/util/openRouterClient.ts`) — never call OpenRouter/the underlying `openai` client directly from a service.
- Never let raw model output drive a DB write — Zod-validate JSON output used as a filter (smart-search), and only use model-suggested IDs (e.g. chat's `productIds`) to re-fetch real records via existing endpoints/services.
- Public, abuse-prone AI endpoints get a route-local `express-rate-limit` instance (see `ai.route.ts`), not a global limiter.

## Linting

`eslint.config.mjs` (flat config) is run via `yarn lint src` / `yarn lint:fix`. Run before considering backend work done.

## Testing

There is no automated test suite — `yarn test` is a stub. "Verification" for backend changes means running `yarn dev` and manually exercising the affected endpoint with curl/Postman, not writing/running tests unless explicitly asked.
