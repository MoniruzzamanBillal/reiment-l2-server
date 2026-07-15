# 11: Low-Stock Inventory Notifications (Backend)

Status: 📝 Planned, awaiting user review/approval. No code changed yet. Pairs with `reiment-l2-client/context/specs/13-low-stock-inventory-notifications-frontend.md`, which depends on this landing first.

## Goal

Notify a vendor live when one of their products' `inventoryCount` drops to or below a low-stock threshold as a result of an order being placed, reusing the existing Pusher realtime infrastructure from spec `06` — no new channel, no new auth logic.

## Context

`order.service.ts`'s `orderItem()` already decrements `Products.inventoryCount` for each cart item inside its `$transaction`, and — per spec `06` — already fires a `new-order` event to `private-vendor-<shopId>` in a fire-and-forget block right after the transaction commits, using `cartItems` (fetched with `include: { product: true }`) captured in the function's outer scope. This is the natural, minimal-footprint place to add a low-stock check: the channel (`private-vendor-<shopId>`) and its authorization (`pusher.service.ts`'s `authorizeChannel`, which already recognizes `private-vendor-*`) are entirely reusable as-is.

## Design

- A local constant `LOW_STOCK_THRESHOLD = 5` in `order.service.ts` — no new schema field, no new config entry. A persisted per-vendor or per-product threshold would be a reasonable future enhancement, but is out of scope here; this keeps the change to the smallest workable fix.
- In the existing inventory-decrement loop, capture the updated product row (`trxnClient.products.update(...)` already returns it — currently discarded) and compare its new `inventoryCount` against the previous value (already available as `item.product.inventoryCount`, via the existing `include: { product: true }`).
- Only flag a product when it **just crossed** the threshold on this specific decrement — `previousCount > LOW_STOCK_THRESHOLD && newCount <= LOW_STOCK_THRESHOLD` — so a vendor is notified once when a product first becomes low-stock, not re-notified on every subsequent order of an already-low-stock item.
- Collect flagged products into a `lowStockAlerts: { shopId: string; productId: string; productName: string; inventoryCount: number }[]` array declared in the outer function scope (closure, same pattern already used for `cartItems`) — not via the transaction's return value, so `orderItem()`'s existing return shape/contract to the controller and frontend is untouched.
- After the transaction commits, in the _same_ existing post-commit `try/catch` block that already triggers `new-order`, also trigger `pusherServer.trigger('private-vendor-' + shopId, 'low-stock', { productId, productName, inventoryCount })` for each entry in `lowStockAlerts` — same channel, same auth, same fire-and-forget/non-blocking guarantee (a Pusher failure here must never throw or affect the order/payment response, exactly like `new-order`).

## Implementation

1. `order.service.ts`:
   - Add `const LOW_STOCK_THRESHOLD = 5;` near the top of the module.
   - Declare `const lowStockAlerts: { shopId: string; productId: string; productName: string; inventoryCount: number }[] = [];` before the `$transaction` call.
   - In the inventory-decrement loop, capture the update result (`const updatedProduct = await trxnClient.products.update(...)`) and push to `lowStockAlerts` when the crossing condition is met, using `item.product.shopId`/`item.product.name` for the shop/product identity.
   - In the existing post-commit `try/catch` block (where `new-order` is triggered), add a second `Promise.all(lowStockAlerts.map(alert => pusherServer.trigger(...)))`.
2. No other backend file changes — `pusher.service.ts`'s existing `private-vendor-*` auth branch already covers this channel; no new route, no new module.

## Dependencies

Hard dependency on spec `06` (Pusher infrastructure: `pusherServer` singleton, `private-vendor-<shopId>` channel, `/pusher/auth`) already being in place — it is. The client spec (`13`) depends on this landing first (needs the `low-stock` event name and payload shape). No dependency on spec `10` (coupon validation fix).

## Verify

- Placing an order that drops a product's `inventoryCount` from above `LOW_STOCK_THRESHOLD` to at/below it triggers a `low-stock` event on `private-vendor-<shopId>`, visible in the Pusher Debug Console.
- Placing a second order against an already-low-stock product does **not** re-trigger `low-stock` (the crossing condition only fires once, on the order that tips it over).
- `new-order` (spec `06`) and the checkout coupon fix (spec `10`) are unaffected.
- `yarn build`/`yarn lint` pass.
