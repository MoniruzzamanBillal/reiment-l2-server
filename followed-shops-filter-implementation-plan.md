# "Only Shops I Follow" Product Filter — Backend Implementation Plan

Status: planned, not yet implemented. Check items off as they're built.

## Context

The store already has a working follow-a-shop feature (`Follower` model, `POST /follow/follow-shop`,
`DELETE /follow/unfollow-shop`, `GET /follow/logged-user-data`), but it isn't connected to product discovery —
the All Products page always shows products in the same default order regardless of what shops a customer
follows. Per real-world e-commerce convention (Etsy/Shopee-style), silently re-ranking search/filter results by
follow-status is bad UX — it breaks the meaning of whatever sort the user picked. The agreed approach is an
**explicit opt-in filter**: the client resolves which shops the logged-in customer follows (via the existing
`/follow/logged-user-data` endpoint) and sends their IDs as a new `shopIds` filter on the existing
`GET /product/all-products` endpoint — the same way `categoryId` works today. No new auth is required on the
products endpoint itself, and no changes are needed in `src/app/modules/follower/` — it already returns
everything required.

## 1. `src/app/modules/products/product.service.ts` — `getAllProducts` (~line 171)

- [ ] Accept a new `filter.shopIds` — a comma-separated string of shop IDs. If present, split it (`.split(",")`)
      and add `andConditions.push({ shopId: { in: shopIds } })`, following the same pattern as the existing
      `categoryId`/`priceRange` branches.
- [ ] Fix `totalItems` to reuse the same `andConditions` (and `isDelated: false`) filter that `allProducts` uses,
      instead of unconditionally counting all non-deleted products via a separate `prisma.products.count({
      where: { isDelated: false } })`. This is a pre-existing bug independent of this feature, but it must be
      fixed here — otherwise turning the new filter on will report a `totalItems`/pagination count for the
      *unfiltered* catalog, making the new feature look broken. Scope this fix strictly to sharing the
      `andConditions` array between the `findMany` and `count` calls — no broader refactor of this function.

## 2. `src/app/modules/products/product.controller.ts` — `getAllProducts` (line ~61-66)

- [ ] Add `"shopIds"` to the `pick(req.query, ["searchTerm", "categoryId", "priceRange", "userId"])` array for
      `filter`. (Leave the existing unused `userId` pick as-is — out of scope for this change.)

## Already in place — no action needed

- [x] `product.route.ts`'s `GET /all-products` stays public/unauthenticated — no auth changes needed since the
      client resolves the follow-relationship itself and only passes shop IDs, the same trust level as any other
      filter param today.
- [x] `follower.service.ts`'s `getLoggedUserFollowShop` already returns `{ shopId, ... }[]` for the logged-in
      customer — no new follower endpoint needed.
- [x] `Products.shopId` / `Shop.id` relation already exists in `prisma/schema.prisma` — no migration needed.
