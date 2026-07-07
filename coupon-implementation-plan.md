# Coupon Feature — Backend Implementation Plan

Status: planned, not yet implemented. Check items off as they're built.

## Context

Today `Coupon` has no date-range fields, `usedCount` is declared but never incremented/enforced anywhere,
there's no per-user usage tracking, and the order flow has a `cuponId`/`couponId` spelling mismatch between
frontend and backend that means **the discount is never actually applied in production today**. This plan adds:
admin-managed date-range validity, an atomically-enforced system-wide usage limit, and a per-user one-time-use
guard — all validated at both a read-only "preview" step and an atomic "commit" step at order placement.

## 1. Prisma schema — `prisma/schema.prisma`

- [ ] Add `startDate DateTime` and `endDate DateTime` to `Coupon`.
- [ ] Add back-relations to `Coupon`: `couponUsage CouponUsage[]`, `order Order[]`.
- [ ] Add new model `CouponUsage` (the per-user one-time-use guard):

  ```prisma
  model CouponUsage {
    id        String   @id @default(uuid())
    couponId  String
    coupon    Coupon   @relation(fields: [couponId], references: [id])
    userId    String
    user      User     @relation(fields: [userId], references: [id])
    orderId   String   @unique
    order     Order    @relation(fields: [orderId], references: [id])
    createdAt DateTime @default(now())

    @@unique([couponId, userId])
    @@map("couponUsage")
  }
  ```

- [ ] Add `couponId String?`, `coupon Coupon? @relation(...)`, `discountAmount Float @default(0)`, and
      `couponUsage CouponUsage?` to `Order` (nullable — most orders have no coupon; `discountAmount` snapshots
      what was actually applied, independent of the coupon's current `discountValue`).
- [ ] Add `couponUsage CouponUsage[]` back-relation to `User`.
- [ ] Run `npx prisma migrate dev --name add_coupon_date_range_and_usage_tracking`.
- [ ] **Decision needed before migrating**: `startDate`/`endDate` are non-nullable. If any coupon rows already
      exist in the dev DB without dates, either clear that test data first or the migration will fail /
      require a temporary default — flag this rather than silently defaulting in the schema.

## 2. `src/app/modules/coupon/coupon.interface.ts` — rewrite

- [ ] `TCoupon = { code: string; discountValue: number; usageLimit: number; startDate: Date; endDate: Date }`
- [ ] Add `TCouponUpdate = Partial<TCoupon>`

## 3. `src/app/modules/coupon/coupon.validation.ts` — new file (doesn't exist today)

- [ ] `addCouponValidationSchema` — zod object matching `TCoupon`, `discountValue`/`usageLimit` as `z.number()`
      (positive, `usageLimit` an int), `startDate`/`endDate` as `z.coerce.date()`, with a `.refine()` that
      `endDate > startDate`.
- [ ] `updateCouponValidationSchema` — same shape, all fields `.optional()`.
- [ ] `applyCouponValidationSchema` — `{ code: z.string().min(1) }` (the checkout "preview apply" payload).
- [ ] Export all three as `couponValidations`, following the `product.validation.ts` pattern.

## 4. `src/app/modules/coupon/coupon.service.ts` — rewrite

- [ ] `addCoupon`: fix existing-code check from `contains` (partial match, a latent bug — "SAVE1" matches
      "SAVE10") to an exact match; `isDeleted: false` in the where clause.
- [ ] `getAllCoupon`: filter `isDeleted: false`, add `orderBy: { createdAt: "desc" }`.
- [ ] New `getSingleCouponById(couponId)`: exact `findUnique`-style lookup (for the admin update-page prefill),
      throws `AppError(400, "Coupon not found.")` if missing/soft-deleted.
- [ ] New `updateCoupon(couponId, payload)`: mirrors `category.service.ts`'s `updateCategory` — look up first
      (404 if missing), then `prisma.coupon.update(...)`.
- [ ] `handleDeleteCoupon`: change from a real hard `prisma.coupon.delete()` to a **soft delete**
      (`data: { isDeleted: true }`), matching the rest of the app's convention (categories etc.) — add an
      existence check first.
- [ ] New shared validator `validateCouponForUse(code)` — read-only, no mutation, exact-match lookup
      (`isDeleted: false`), then throws on: - not found → `AppError(404, "Coupon code not found.")` - `now < startDate` → `AppError(400, "This coupon is not active yet. It becomes valid on {startDate}.")` - `now > endDate` → `AppError(400, "This coupon expired on {endDate}.")` — the specific expiry message
      the user asked for. - `usedCount >= usageLimit` → `AppError(400, "This coupon has reached its maximum usage limit and can no
    longer be used.")` - otherwise returns the coupon row.
- [ ] New `checkUserCouponEligibility(couponId, userId)` — read-only, looks up
      `couponUsage.findUnique({ where: { couponId_userId: { couponId, userId } } })`; if found, throws
      `AppError(400, "You have already used this coupon.")`.
- [ ] New `previewApplyCoupon(code, userId)` — calls `validateCouponForUse` then
      `checkUserCouponEligibility`, returns the coupon row (id, code, discountValue, etc.) for the checkout
      page to display.
- [ ] Export `couponServices = { addCoupon, updateCoupon, getAllCoupon, getSingleCouponById,
  handleDeleteCoupon, previewApplyCoupon, validateCouponForUse, checkUserCouponEligibility }` (last two
      exported so `order.service.ts` can reuse the same message strings/comparison logic at commit time).

## 5. `src/app/modules/coupon/coupon.controller.ts` — modify

- [ ] Rename `getSingleCoupon` → `previewApplyCoupon`: reads `req.body.code` (was the mismatched
      `req.body?.coupon`) and `req.user?.userId`, calls the new service function.
- [ ] Add `getSingleCoupon` (by `:id`, admin-only, for update-page prefill).
- [ ] Add `updateCoupon` controller.
- [ ] Fix response status codes: `getAllCoupon` / `getSingleCoupon` / `previewApplyCoupon` / `deleteCoupon` /
      `updateCoupon` should send `httpStatus.OK` (200), not the currently-wrong `httpStatus.CREATED` (201).
      `addCoupon` correctly stays `201`.

## 6. `src/app/modules/coupon/coupon.route.ts` — rewrite

- [ ] `GET /all-coupon` → `validateUser(UserRole.ADMIN)`
- [ ] `POST /add-coupon` → `validateUser(UserRole.ADMIN)` + `validateRequest(addCouponValidationSchema)`
- [ ] `GET /get-coupon/:id` (new — admin by-id lookup) → `validateUser(UserRole.ADMIN)`
- [ ] `PATCH /update-coupon/:id` (new) → `validateUser(UserRole.ADMIN)` + `validateRequest(updateCouponValidationSchema)`
- [ ] `PATCH /delete-coupon/:id` → `validateUser(UserRole.ADMIN)`
- [ ] `POST /apply-coupon` (new — replaces the old public `POST /get-coupon`) → `validateUser(UserRole.CUSTOMER)` + `validateRequest(applyCouponValidationSchema)` — this is the checkout page's "Apply" button target.
- [ ] **All 6 routes currently have zero auth/validation middleware** — this closes that gap entirely (today
      anyone unauthenticated can create/list/delete coupons).

## 7. `src/app/modules/order/order.interface.ts` — populate (currently empty)

- [ ] `TOrderPayload = { cartId: string; couponId?: string }`

## 8. `src/app/modules/order/order.validation.ts` — populate (currently empty)

- [ ] `orderItemValidationSchema`: `{ cartId: z.string().min(1), couponId: z.string().optional() }`

## 9. `src/app/modules/order/order.route.ts` — modify

- [ ] Add `validateRequest(orderValidations.orderItemValidationSchema)` to `POST /order-item`, after the
      existing `validateUser(UserRole.CUSTOMER)` (already in place — no change needed there).

## 10. `src/app/modules/order/order.service.ts` — core transactional rewrite

- [ ] **Fix the `cuponId` → `couponId` typo** (the root cause of discounts never applying today).
- [ ] Inside the existing `prisma.$transaction`, in this exact order:
  1. If `couponId` present: re-validate inside the transaction (`trxnClient.coupon.findFirst`, `isDeleted: false`)
     — existence, `startDate`/`endDate` checks — using the **same message strings** as `validateCouponForUse`
     (extract the pure date-comparison logic into a small shared helper, e.g. `assertCouponDatesValid(coupon)`,
     importable by both `coupon.service.ts` and `order.service.ts`, since the Prisma query itself must run
     against `trxnClient` rather than the singleton, but the comparison/message logic shouldn't be duplicated).
  2. **Atomic system-wide claim**: `trxnClient.coupon.updateMany({ where: { id: couponId, usedCount: { lt:
coupon.usageLimit } }, data: { usedCount: { increment: 1 } } })` — if `claim.count === 0`, throw
     `AppError(400, "This coupon has reached its maximum usage limit and can no longer be used.")`. This
     conditional `updateMany` is what makes the limit race-safe: concurrent checkouts serialize on the DB row
     lock and only one can win the last remaining slot.
  3. Compute `discountAmount = coupon.discountValue` and subtract from `totalPrice` — only after the claim
     succeeds, so a failed claim never mutates the total.
  4. Create the `Order` (now carrying `couponId` + `discountAmount`) — must happen before step 5 because
     `CouponUsage.orderId` is a required unique FK.
  5. **Atomic per-user claim**: `trxnClient.couponUsage.create({ data: { couponId, userId, orderId: order.id } })`
     inside a try/catch — if it throws Prisma error `P2002` (unique-constraint violation on
     `[couponId, userId]`), throw `AppError(400, "You have already used this coupon.")`. Because this is all
     one interactive transaction, a failure here automatically rolls back the usedCount increment and the
     order creation from steps 2–4 together — no partial state is possible.
  6. All existing steps (orderItem creation, cart/cartItem cleanup, inventory decrement loop, `initPayment`
     call) stay exactly where they are today, unchanged relative to each other.
- [ ] No changes needed to `payment.service.ts` — per the confirmed decision, coupon accounting happens at
      order-placement, not the SSLCommerz success callback.

## 11. Error message matrix (preview vs. commit — same wording, different enforcement point)

| Failure mode              | Preview (`POST /coupon/apply-coupon`)                                              | Commit (`POST /order/order-item`, inside `$transaction`)             |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Code doesn't exist        | `AppError(404, "Coupon code not found.")`                                          | same, from `trxnClient.coupon.findFirst` returning null              |
| Not yet started           | `AppError(400, "This coupon is not active yet. It becomes valid on {startDate}.")` | same                                                                 |
| Expired                   | `AppError(400, "This coupon expired on {endDate}.")`                               | same                                                                 |
| Usage limit reached       | same message, checked via a plain read (best-effort UX only)                       | **enforced** via the atomic `updateMany` claim (`count === 0`)       |
| Already used by this user | same message, checked via a plain read                                             | **enforced** via the `couponUsage` unique constraint + `P2002` catch |

`globalErrorHandler.ts` already forwards `AppError.message` verbatim as the JSON `message` field (confirmed by
direct read) — no plumbing changes needed for these specific messages to reach the frontend.

## Already in place — no action needed

- [x] `order.route.ts`'s `POST /order-item` already has `validateUser(UserRole.CUSTOMER)`.
- [x] `catchAsync`, `sendResponse`, `AppError`, `validateUser`, `validateRequest`, and the `prisma` singleton
      (`src/app/util/prisma.ts`) all reusable as-is.
- [x] `globalErrorHandler.ts` already surfaces `AppError` messages verbatim — verified by direct read.
- [x] `payment.service.ts` needs zero changes (confirmed decision: usage counted at order-placement).
- [x] `category.service.ts`'s soft-delete/update pattern is a directly-mirrorable reference — no new pattern
      needs to be invented for `coupon.service.ts`'s `updateCoupon`/fixed `handleDeleteCoupon`.
