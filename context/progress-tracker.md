# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Active feature development (not initial build-out) — core catalog, auth, cart/order/payment, vendor/admin CRUD, follow system, the AI module (description generation, chat, smart search), coupon correctness, and the shop-follow → product-discovery connection are all now built.

## Spec Implementation Status

Tracks work items defined in `context/specs/`. Update the moment implementation starts or finishes on a spec.

| Spec | Status | Notes |
| --- | --- | --- |
| [`01-ai-integration.md`](specs/01-ai-integration.md) | ✅ Complete | `ai` module (`generate-description`, `chat`, `smart-search`) scaffolded and wired into `router/index.ts`, all routed through `askOpenRouter`. Delivered per the root `implementationplan.md`. |
| [`02-coupon-feature.md`](specs/02-coupon-feature.md) | ✅ Complete | Re-verified against `coupon-implementation-plan.md` (root): schema (`startDate`/`endDate`, `CouponUsage` model), the atomic `usedCount` claim + `CouponUsage` P2002 race-guard inside `order.service.ts`'s `$transaction`, the `POST /coupon/apply-coupon` preview endpoint, and the `cuponId`→`couponId` fix are all present and correct (landed in `9e2ee770`; the doc had gone stale, this row corrects it). |
| [`03-followed-shops-filter.md`](specs/03-followed-shops-filter.md) | ✅ Complete | `shopIds` filter branch + `totalItems` count fix landed in `product.service.ts`/`product.controller.ts`, simultaneously with the frontend toggle. `yarn build`/`yarn lint` pass (lint output is pre-existing unrelated warnings only). |
| [`04-backend-testing.md`](specs/04-backend-testing.md) | ⛔ Not started | Jest + Supertest integration tests for coupon/follower/auth modules against a real test database. No test suite exists today. |
| [`05-ci-pipeline-backend.md`](specs/05-ci-pipeline-backend.md) | ⛔ Not started | GitHub Actions workflow with an ephemeral Postgres service; lint/build/migrate/test. Depends on `04`. |
| [`06-realtime-notifications-backend.md`](specs/06-realtime-notifications-backend.md) | ⛔ Not started | Socket.io server emitting `new-order`/`order-status-changed`. Candidate depth feature (alt: `07`). Pairs with client spec `10`. |
| [`07-payment-module-hardening.md`](specs/07-payment-module-hardening.md) | ⛔ Not started | Type the SSLCommerz webhook payload, add idempotency guard, evaluate `val_id` validation. Candidate depth feature (alt: `06`). |
| [`08-backend-code-quality-cleanup.md`](specs/08-backend-code-quality-cleanup.md) | ⛔ Not started | Replace remaining `any` signatures with typed interfaces (outside `payment/`); remove unused `bcrypt` dependency. |
| [`09-dockerization.md`](specs/09-dockerization.md) | ⛔ Not started | API `Dockerfile` + `docker-compose.yml` (Postgres + API + client). Owns the shared compose file; coordinates with client spec `12`. |

## Completed (already implemented, wired into `router/index.ts`)

- `auth` — register, login, JWT issuance (`argon2` password hashing).
- `user` / `admin` — user management, admin oversight actions.
- `category` — CRUD.
- `shop` — vendor shop CRUD (1:1 with `User`).
- `products` — CRUD, `/all-products` (search/filter/sort/pagination), flash-sale listing, related/duplicate product endpoints.
- `cart` — cart/cart-item management.
- `order` — order placement, order items.
- `payment` — SSLCOMMERZ-style payment flow.
- `address` — customer address book.
- `review` — product review CRUD.
- `follower` — follow/unfollow a shop, logged-in user's followed-shop list (`Follower` model), connected to product discovery via `product.service.ts`'s `shopIds` filter.
- `coupon` — full CRUD, date-range validity, atomic system-wide + per-user usage enforcement; discount actually applies at order placement.
- `ai` — `generate-description` (vendor-only), `chat` (public), `smart-search` (public), all via `askOpenRouter`, public endpoints rate-limited (10 req/min/IP).

## Recent Activity

- `shopIds` filter + `totalItems` count fix added to `product.service.ts`/`product.controller.ts` for the followed-shops-filter spec.
- `1678f42c` merge — `5afaa1ea fix: ssl payment url update`.
- `9e2ee770 feat: added coupon functionality` — full coupon rewrite landed (schema, `CouponUsage`, atomic transaction, `couponId` fix) — confirmed complete on re-verification, despite the doc previously saying otherwise.
- `2c2f44f8 feat: cupon implementation plan` — the coupon rewrite plan (`coupon-implementation-plan.md`) was added, then implemented in `9e2ee770`.
- `b1992ed4 feat: openrouter free model` — `askOpenRouter` fallback-model client landed.
- `aa85cc80` / `8088390f feat: ai module add` — the `ai` module scaffolded.
- `d6004a59 feat: ai implementation plan added` — the AI integration plan (`implementationplan.md`) landed and was subsequently implemented.

## Known Gaps / Open Questions

- No automated test suite configured — verification is `yarn build` + `yarn lint` + manual curl/Postman check. The followed-shops-filter change could not be curl-verified end-to-end in this environment (no network access to the dev database); `yarn build`/`yarn lint` pass and the change was verified by code review against the exact `andConditions` pattern already used by `categoryId`/`priceRange`.
- `bcrypt` is a listed dependency but unused (its import is commented out in `auth.service.ts` in favor of `argon2`) — candidate for removal from `package.json`, not done automatically.
- `boilerModule` (mounted at `/test`) and `payment` don't follow the standard five-file module convention — intentional pre-existing exceptions, not something to "fix" as a drive-by.

## Next Up

Open — driven by whatever feature/fix is requested next. Both the coupon rewrite and the followed-shops filter are now complete.

(End of file)
