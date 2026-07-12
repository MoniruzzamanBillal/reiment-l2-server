# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Active feature development (not initial build-out) — core catalog, auth, cart/order/payment, vendor/admin CRUD, follow system, and the AI module (description generation, chat, smart search) are already built; coupon correctness and the shop-follow → product-discovery connection are in-flight.

## Spec Implementation Status

Tracks work items defined in `context/specs/`. Update the moment implementation starts or finishes on a spec.

| Spec | Status | Notes |
| --- | --- | --- |
| [`01-ai-integration.md`](specs/01-ai-integration.md) | ✅ Complete | `ai` module (`generate-description`, `chat`, `smart-search`) scaffolded and wired into `router/index.ts`, all routed through `askOpenRouter`. Delivered per the root `implementationplan.md`. |
| [`02-coupon-feature.md`](specs/02-coupon-feature.md) | ⛔ Not started | Full rewrite plan written (`coupon-implementation-plan.md`, root) — schema migration, `CouponUsage` model, atomic `usedCount` claim, and the `cuponId`→`couponId` fix in `order.service.ts` are all still pending. Today the discount is never actually applied in production. |
| [`03-followed-shops-filter.md`](specs/03-followed-shops-filter.md) | 📝 Planned, awaiting approval | Plan written (`followed-shops-filter-implementation-plan.md`, root): add a `shopIds` filter to `product.service.ts`'s `getAllProducts` plus a `totalItems` count fix. User is reviewing before implementation starts; frontend plan depends on this landing first. |

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
- `follower` — follow/unfollow a shop, logged-in user's followed-shop list (`Follower` model) — not yet connected to product discovery.
- `coupon` — CRUD exists, but functionally broken end-to-end in production (see the coupon spec).
- `ai` — `generate-description` (vendor-only), `chat` (public), `smart-search` (public), all via `askOpenRouter`, public endpoints rate-limited (10 req/min/IP).

## Recent Activity (from `git log`)

- `1678f42c` merge — `5afaa1ea fix: ssl payment url update`.
- `9e2ee770 feat: added coupon functionality` — coupon CRUD/checkout support landed, but see the known `cuponId`/`couponId` mismatch below.
- `2c2f44f8 feat: cupon implementation plan` — the coupon rewrite plan (`coupon-implementation-plan.md`) was added; not yet implemented.
- `b1992ed4 feat: openrouter free model` — `askOpenRouter` fallback-model client landed.
- `aa85cc80` / `8088390f feat: ai module add` — the `ai` module scaffolded.
- `d6004a59 feat: ai implementation plan added` — the AI integration plan (`implementationplan.md`) landed and was subsequently implemented.

## Known Gaps / Open Questions

- No automated test suite configured — verification is `yarn build` + `yarn lint` + manual curl/Postman check.
- Coupon discount is not actually applied in production today (`cuponId`/`couponId` spelling mismatch between this repo and the frontend, plus no date-range/usage-limit enforcement) — see `coupon-implementation-plan.md` (root) and `context/specs/02-coupon-feature.md`.
- The follow-a-shop feature isn't yet connected to product discovery on `/product/all-products` — see `followed-shops-filter-implementation-plan.md` (root) and `context/specs/03-followed-shops-filter.md`.
- `bcrypt` is a listed dependency but unused (its import is commented out in `auth.service.ts` in favor of `argon2`) — candidate for removal from `package.json`, not done automatically.
- `boilerModule` (mounted at `/test`) and `payment` don't follow the standard five-file module convention — intentional pre-existing exceptions, not something to "fix" as a drive-by.

## Next Up

Open — driven by whatever feature/fix is requested next. The followed-shops filter is the most likely next implementation once the user approves the reviewed plan; the coupon rewrite is the larger pending item once prioritized.

(End of file)
