# 03: Followed Shops Product Filter

Status: ✅ Complete. Full checklist lives in root `followed-shops-filter-implementation-plan.md` — this is a condensed summary, not a replacement for it.

## Goal

Let the client offer an explicit opt-in "Only shops I follow" filter on the All Products page, by adding a `shopIds` filter to the existing product listing endpoint.

## Context

The store already has a working follow-a-shop feature (`Follower` model, `follow-shop`/`unfollow-shop`/`logged-user-data` endpoints), but it isn't connected to product discovery — `GET /product/all-products` has no way to scope results to a set of shops. The agreed approach (real-world e-commerce convention) is an explicit opt-in filter, not silent re-ranking, so no auth changes are needed on the endpoint itself — the client resolves which shops a customer follows and passes their IDs through like any other filter.

## Design

- `product.service.ts`'s `getAllProducts` gains a new filter branch: `filter.shopIds` (comma-separated string) → split and `andConditions.push({ shopId: { in: shopIds } })`, following the existing `categoryId`/`priceRange` pattern.
- Fix a pre-existing bug in the same function while touching it: `totalItems` is currently computed via an unconditional `prisma.products.count({ where: { isDelated: false } })` that ignores `andConditions` — reuse the same `andConditions`/`isDelated` filter for the count, scoped strictly to this fix (no broader refactor), since otherwise the new toggle would report a misleading total/pagination count.
- `product.controller.ts` adds `"shopIds"` to the `pick(req.query, [...])` filter array.

## Implementation

1. `src/app/modules/products/product.service.ts` — add the `shopIds` branch; fix `totalItems`.
2. `src/app/modules/products/product.controller.ts` — add `"shopIds"` to the filter pick list.
3. No changes to `product.route.ts`, `product.validation.ts`, or `follower.service.ts` — `getLoggedUserFollowShop` already returns everything the client needs.

## Dependencies

Frontend: `reiment-l2-client/followed-shops-filter-implementation-plan.md` depends on this landing first (adds the toggle UI and resolves+passes `shopIds`).

## Verify

- `GET /product/all-products?shopIds=<id1,id2>` returns only products from those shops, composable with existing `searchTerm`/`categoryId`/`priceRange`/sort params.
- `totalItems`/pagination in the response reflect the filtered count, not the full catalog.
- Omitting `shopIds` behaves exactly as before (no regression to the default listing).
