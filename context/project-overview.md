# Project Overview: Reiment (Backend / API)

## Overview

Reiment's backend is a REST API built with Express, TypeScript, and PostgreSQL (via Prisma) that powers a multi-role e-commerce platform. It serves the `reiment-l2-client` Next.js frontend and handles authentication, shop/product/category management, cart/order/payment flows, coupons, reviews, the shop-follow feature, and AI-assisted features (product description generation, shopping chat, smart search).

## Roles

Defined in the `UserRole` enum (Prisma, `@prisma/client`): `ADMIN`, `VENDOR`, `CUSTOMER`. Enforced per-route via `validateUser(...roles)` (`src/app/middleware/validateUser.ts`).

## Core Flows

### Admin
1. Manages categories, shops, users, and coupons (CRUD + soft delete via `isDelated`/`isDeleted`).
2. Monitors reviews and transactions platform-wide.
3. Views dashboard statistics for the admin analytics UI.

### Vendor
1. Creates and manages their shop (1:1 relation between `User` and `Shop`).
2. Adds/updates/deletes products (`src/app/modules/products/`), optionally with an AI-generated description draft (`POST /api/ai/generate-description`).
3. Views orders placed for their products.

### Customer
1. Registers/logs in (`src/app/modules/auth/`) to receive a JWT (`userId`, `userRole` in the payload, signed with `config.jwt_secret`).
2. Browses/searches/filters products (`GET /api/product/all-products`, no auth required) and shop pages.
3. Adds to cart, applies a coupon, and places an order (`src/app/modules/cart/`, `order/`, `payment/`).
4. Follows/unfollows shops (`src/app/modules/follower/`) and leaves reviews (`src/app/modules/review/`).
5. Can chat with the public AI shopping assistant (`POST /api/ai/chat`) or use AI smart search (`POST /api/ai/smart-search`) — both public, no login required.

## Features by Category

- **Authentication:** JWT-based login/registration, role-based route protection, `argon2` password hashing (the `bcrypt` dependency is an unused leftover — see Known Gaps in `context/progress-tracker.md`).
- **Catalog:** category/shop/product CRUD, search/filter/sort/pagination on `/product/all-products`, flash-sale products, product comparison support.
- **Cart & Orders:** cart/cart-item management, order placement, order items, address book.
- **Coupons:** admin-managed coupon CRUD — today missing date-range validity and enforced usage limits; a `cuponId`/`couponId` spelling mismatch with the frontend means discounts are never actually applied in production (see `context/specs/02-coupon-feature.md`).
- **Payments:** SSLCOMMERZ-style payment flow (`src/app/modules/payment/`).
- **Reviews:** product review CRUD tied to a product/shop.
- **Follow system:** customer follow/unfollow a shop (`Follower` model), consumed today only by the shop-detail page and the customer's "Followed Shops" dashboard list — not yet wired into product discovery (see `context/specs/03-followed-shops-filter.md`).
- **AI integration:** all three endpoints route through one shared client, `askOpenRouter` (`src/app/util/openRouterClient.ts`), which tries a fallback list of free OpenRouter models and throws `AppError` if all fail. Model output that could drive a DB write is never trusted directly (smart-search JSON is Zod-validated read-only filter input; chat's `productIds` are only used to re-fetch real products).

## In Scope

- Express REST API for the above flows, backing the `reiment-l2-client` Next.js app exclusively over `NEXT_PUBLIC_API_BASE_URL`.
- PostgreSQL via Prisma as the sole persistence layer.
- OpenRouter (via `askOpenRouter`) for all AI features.

## Out of Scope (as currently built)

- No automated test suite (`yarn test` is a stub that exits with an error) — verification is `yarn dev` + manual curl/Postman.
- No shared code/types with `reiment-l2-client` — this is an independent git repository.
- Coupon date-range fields, `usedCount` enforcement, and per-user usage tracking are **not yet built** — see `coupon-implementation-plan.md` (root) / `context/specs/02-coupon-feature.md`.

## Success Criteria

- A customer can register, browse/search products, cart, apply a coupon, check out, follow shops, and leave reviews.
- A vendor can build out their shop and product catalog, optionally with AI-generated descriptions.
- An admin can manage categories/shops/users/coupons and see platform-wide oversight data.
- Role-based route protection correctly restricts admin/vendor-only endpoints per `validateUser(...roles)`.
