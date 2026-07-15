# 10: Fix `couponId: null` Rejected by Order Validation

Status: 📝 Planned, awaiting user review/approval. No code changed yet.

## Goal

Allow checkout to succeed whether or not a coupon is applied. Today, checking out **without** a coupon fails at `POST /order/order-item` with a 400, because the request body sends `couponId: null` and the Zod validation schema only accepts `string | undefined`.

## Context

Discovered while manually testing the just-shipped Pusher realtime-notifications feature (specs `06`/`10`): placing a test order without applying a coupon fails with:

```
{
  "path": ["body", "couponId"],
  "message": "Expected string, received null"
}
```

Root cause, traced end to end:

- `stores/useCouponStore.ts` (client) models "no coupon selected" as `couponId: null` — its literal default, and what `resetCoupon()` restores it to after a failed apply or a successful order. This is a reasonable modeling choice, not a bug in itself.
- `app/(public)/checkout/page.tsx`'s submit handler passes that store value straight into the request payload — `payload: { cartId: cart?.id, couponId }` — with no null-to-undefined conversion.
- `src/app/modules/order/order.validation.ts` declares `couponId: z.string().optional()`, which accepts `undefined` but rejects `null` — Zod treats the two as distinct types by default, and `.optional()` only widens to `string | undefined`.
- `src/app/modules/order/order.service.ts`'s downstream logic (`if (couponId) { ... }`) already treats `null` and `undefined` identically (both falsy) — so nothing past validation needs to change; the schema is stricter than the code that consumes it.

This is unrelated to the coupon rewrite (spec `02`, already complete) or the Pusher work (specs `06`/`10`, already complete) — it's a previously-undiscovered edge case in the no-coupon checkout path that only surfaces because the value is `null` rather than an omitted key.

## Design

Single-line fix, backend only: change the Zod field from `.optional()` to `.nullish()` (Zod's built-in modifier for "accept `string | null | undefined`"), so the validator treats a `null` coupon id the same as an absent one — matching what `order.service.ts` already does with it downstream.

No frontend change: `useCouponStore`'s `null` default is a legitimate way to represent "no coupon selected," and the backend contract should accept it rather than the frontend being made to paper over it with a `?? undefined` at the call site.

## Implementation

1. `src/app/modules/order/order.validation.ts` — change `couponId: z.string().optional()` to `couponId: z.string().nullish()`.
2. No other file changes required — `order.service.ts`'s existing `if (couponId)` branches already handle `null` correctly.

## Dependencies

None — isolated one-line validation fix. Doesn't touch the coupon transaction logic from spec `02` or the Pusher emission logic from spec `06`.

## Verify

- Checkout **without** a coupon (`couponId: null` in the request body) succeeds — order is created, no 400.
- Checkout **with** a valid coupon (`couponId: "<uuid>"`) still succeeds and still applies the discount/date-range/usage-limit checks exactly as before — `.nullish()` still requires a valid string when one is actually provided, it only additionally tolerates `null`.
- `yarn build`/`yarn lint` pass.
