# 07: Payment Module Hardening

Status: 📝 Planned, awaiting user review/approval. No code changed yet. One of two candidate "depth" features (the other being spec `06`, real-time notifications) — pick one, not both. Backend-leaning alternative if the target roles skew infra/backend rather than full-stack-visible.

## Goal

Bring the `payment` module up to the standard the rest of the codebase holds itself to, and close a real correctness gap: the SSLCommerz webhook handler currently has no idempotency guard, so a duplicate/replayed webhook call could process the same payment twice.

## Context

`payment/` is explicitly documented in `CLAUDE.md` as a pre-existing exception to the five-file module convention (`payment.controller.ts`, `payment.service.ts`, `payment.route.ts`, `payment.util.ts` — no `validation`/`interface` split). Its `successfullyPayment` service function takes `payload: any` and does:

```ts
const successfullyPayment = async (payload: any) => {
  const { tran_id, status } = payload;
  if (status !== "VALID") { throw new AppError(...) }
  const result = await prisma.order.update({
    where: { trxnNumber: tran_id },
    data: { status: OrderStatus.COMPLETED },
  });
  return result;
};
```

Two real gaps, not cosmetic ones: (1) `payload` is untyped, so nothing catches a malformed SSLCommerz callback at the type level; (2) there is no check for the order's *current* status before updating — if SSLCommerz calls this webhook twice for the same `tran_id` (a documented real-world possibility with payment gateway webhooks), the update runs twice with no ill effect today only because it's idempotent by coincidence (setting `COMPLETED` twice is harmless) — but that's fragile if any side effect (e.g. spec `06`'s `order-status-changed` emission, or a future email/inventory-decrement hook) gets added to this path later, since it would then fire twice for one real payment.

## Design

- Add `payment.interface.ts` with a typed `TSslCommerzCallback` (or similarly named) type for the webhook payload, replacing `payload: any`.
- Add `payment.validation.ts` if the payload needs Zod validation before use (matching the `validateRequest` convention used elsewhere) — decide based on whether SSLCommerz's callback body is trustworthy enough to validate structurally vs. needing signature verification instead (SSLCommerz webhooks are typically verified via their `val_id` server-to-server validation API, not a payload signature — worth confirming their docs before assuming Zod alone is sufficient).
- Idempotency: before updating, check the order's current `status`; if it's already `COMPLETED`, short-circuit and return the existing record rather than re-running the update (and, once spec `06` lands, avoid re-emitting `order-status-changed`).

## Implementation

1. `payment.interface.ts` — typed webhook payload shape.
2. `payment.service.ts` — replace `payload: any` with the new type; add the already-`COMPLETED` short-circuit check before the `prisma.order.update` call.
3. `payment.controller.ts` — pass through the typed payload.
4. Evaluate (research, not assumed) whether SSLCommerz's `val_id` server-side validation call should be added before trusting `status === "VALID"` from the client-supplied callback body alone — if SSLCommerz's docs recommend it (typical for payment gateways, to prevent a forged success callback), that's a real security hardening item, not just a typing cleanup.
5. Leave `payment.route.ts`'s existing route shape and the module's overall five-file-exception status as-is unless the interface/validation additions naturally resolve it — not a mandate to fully conform the module if the shape doesn't fit its webhook nature.

## Dependencies

None. If spec `06` (real-time notifications) also lands, the idempotency short-circuit here directly prevents a duplicate-event bug in that feature — worth doing this spec first if both are ever implemented, though only one is planned per the roadmap.

## Verify

- Calling the success webhook twice for the same `tran_id` results in exactly one meaningful update (second call short-circuits, does not error, does not double-process).
- `payload: any` is gone from `payment.service.ts`; `yarn build`/`yarn lint` pass.
- If server-side `val_id` validation is added: a forged callback with `status: "VALID"` but an invalid `val_id` is rejected rather than trusted.
