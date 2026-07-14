# 06: Real-Time Order Notifications (Backend)

Status: 📝 Planned, awaiting user review/approval. No code changed yet. One of two candidate "depth" features (the other being spec `07`, payment hardening) — pick one, not both. Pairs with `reiment-l2-client/context/specs/10-realtime-notifications-frontend.md`, which depends on this landing first.

## Goal

Emit live events when an order is placed or its status changes, so the client can push real-time updates to vendors and customers instead of relying on polling/manual refresh.

## Context

`order.service.ts` already has the two moments that matter: order creation, and order-status transitions (the same `OrderStatus` enum the payment module updates to `COMPLETED` on a successful SSLCommerz callback). This spec adds an event-emission layer on top of those existing writes — it does not change order business logic, validation, or the coupon-usage transaction from spec `02`.

## Design

- `socket.io` server, initialized once alongside the existing Express `app.ts`/`server.ts` bootstrap (Socket.io needs the raw HTTP server, not just the Express app, so this touches `server.ts`'s server-creation point, not `app.ts`'s route wiring).
- Two events: `new-order` (emitted to a room scoped to the order's shop's vendor, e.g. room name `vendor:<shopId>`) and `order-status-changed` (emitted to a room scoped to the customer, e.g. `customer:<userId>`) — room-based scoping so a vendor never receives another vendor's order events, matching the existing per-role authorization posture (`validateUser(...)`) rather than broadcasting globally and filtering client-side.
- Socket auth: on connection, the client sends its JWT (already issued by `auth` module); the server verifies it the same way `validateUser` does for HTTP requests, then joins the socket to the appropriate room(s) based on the decoded role/id — reusing the existing JWT verification logic rather than inventing a parallel auth scheme.
- Emission points: `order.service.ts`'s order-creation function emits `new-order` after the Prisma write succeeds (not before — never emit on an operation that might still fail); `payment.service.ts`'s `successfullyPayment` (and any other order-status-changing path) emits `order-status-changed` after its `prisma.order.update` succeeds.

## Implementation

1. Add `socket.io` dependency.
2. `src/app/util/socket.ts` (or similar) — initializes the Socket.io server given the raw HTTP server instance, exports an `io` singleton (mirroring the existing `prisma` singleton pattern at `src/app/util/prisma.ts`) so any service can call `io.to(room).emit(...)` without prop-drilling the instance through every layer.
3. `server.ts` — create the HTTP server explicitly (`http.createServer(app)`) instead of (or in addition to) `app.listen(...)`, and pass it to the socket initializer.
4. Socket connection handler — verify JWT from the handshake `auth` payload, join `vendor:<shopId>` or `customer:<userId>` room based on decoded role.
5. `order.service.ts` — emit `new-order` after successful order creation.
6. `payment.service.ts`'s `successfullyPayment` (and any admin/vendor order-status-update path in `order.service.ts`, if one exists) — emit `order-status-changed` after the status write succeeds.

## Dependencies

None — additive, doesn't change existing HTTP behavior or response shapes. The client spec (`10`) depends on this landing first. Benefits from spec `09`'s dockerization if load-testing multiple concurrent socket connections locally, but doesn't require it.

## Verify

- Placing an order via the existing `POST /order` (or equivalent) endpoint results in a `new-order` event received only by a socket connected as that order's shop's vendor, not by other vendors' sockets.
- A successful SSLCommerz payment callback results in an `order-status-changed` event received only by that order's customer.
- Existing HTTP order/payment flows are unaffected — `yarn build`/`yarn lint` pass, and the emission calls are fire-and-forget (a socket emission failure must never throw or block the HTTP response).
