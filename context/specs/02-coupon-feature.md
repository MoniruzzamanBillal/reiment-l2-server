# 02: Coupon Feature

Status: ⛔ Not started. Full checklist lives in root `coupon-implementation-plan.md` — this is a condensed summary, not a replacement for it.

## Goal

Make coupon discounts actually apply in production, with admin-managed date-range validity, a race-safe system-wide usage limit, and a per-user one-time-use guard.

## Context

Today `Coupon` has no date-range fields, `usedCount` is declared but never incremented/enforced, there's no per-user usage tracking, and the order flow has a `cuponId`/`couponId` spelling mismatch against the frontend that means **the discount is never actually applied today**, despite checkout UI existing for it.

## Design

- Add `startDate`/`endDate` to `Coupon`; add a new `CouponUsage` model (`couponId`, `userId`, `orderId`, unique on `[couponId, userId]`) as the per-user guard; add `couponId`/`discountAmount`/`couponUsage` to `Order`.
- Two enforcement points with the same message strings: a read-only **preview** (`POST /coupon/apply-coupon`) for checkout UX, and an atomic **commit** inside `order.service.ts`'s `$transaction` at order placement — the atomic `updateMany({ where: { usedCount: { lt: usageLimit } }, data: { increment: 1 } })` claim is what makes the system-wide limit race-safe under concurrent checkouts; the `CouponUsage` unique-constraint (`P2002`) catch is what makes the per-user guard race-safe.
- Fix the `cuponId` → `couponId` typo in `order.service.ts` — this is the root cause of discounts never applying today.

## Implementation

See root `coupon-implementation-plan.md` for the full per-file checklist across `prisma/schema.prisma`, `coupon.interface.ts`, `coupon.validation.ts` (new file), `coupon.service.ts` (rewrite), `coupon.controller.ts`, `coupon.route.ts` (adds auth/validation to all 6 routes — currently none exists), `order.interface.ts`/`order.validation.ts` (currently empty, need populating), and `order.service.ts`'s transactional rewrite.

## Dependencies

Frontend: `reiment-l2-client/coupon-implementation-plan.md` depends on this backend plan landing first (new `apply-coupon` endpoint, fixed `couponId` key, new error messages to surface verbatim).

## Verify

- A valid, in-range, under-limit coupon actually reduces the order total at commit time, not just in the preview response.
- Concurrent checkouts against the last remaining usage slot: exactly one succeeds, no over-redemption.
- A user who already used a coupon is rejected on a second attempt, even under concurrent requests.
- Expired/not-yet-active/limit-reached/already-used all produce the specific `AppError` messages listed in the plan's error-message matrix, from both the preview and commit paths.
