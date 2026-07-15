# 06: Real-Time Order Notifications (Backend)

Status: 📝 Planned, awaiting user review/approval. No code changed yet. One of two candidate "depth" features (the other being spec `07`, payment hardening) — pick one, not both. Pairs with `reiment-l2-client/context/specs/10-realtime-notifications-frontend.md`, which depends on this landing first.

## Goal

Emit live events when an order is placed or its status changes, so the client can push real-time updates to vendors and customers instead of relying on polling/manual refresh.

## Context

`order.service.ts` already has the two moments that matter: order creation, and order-status transitions (the same `OrderStatus` enum the payment module updates to `COMPLETED` on a successful SSLCommerz callback). This spec adds an event-emission layer on top of those existing writes — it does not change order business logic, validation, or the coupon-usage transaction from spec `02`.

This was originally designed around a raw `socket.io` server sharing the Express HTTP server. That's incompatible with how this repo is actually deployed: `vercel.json` builds `dist/server.js` via `@vercel/node`, a stateless serverless function with no persistent process and no in-memory room state across invocations — a Socket.io server cannot run there at all, on any Vercel plan. The design below replaces the transport with **Pusher Channels** (managed pub/sub, free Sandbox tier), which fits serverless naturally: the backend only ever makes an outbound HTTP call to publish an event, and Pusher's own infrastructure holds the persistent connection to the browser.

## Design

- `pusher` (server SDK) singleton at `src/app/util/pusher.ts`, mirroring the existing `prisma` singleton pattern (`src/app/util/prisma.ts`) — exports a configured `pusherServer` instance so any service can call `pusherServer.trigger(...)` without prop-drilling. Config (`PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`) is read only through `src/app/config/index.ts`, per that file's existing convention — never inline `process.env`.
- Channels are scoped per vendor shop and per customer, same as the original room-based design: `private-vendor-<shopId>` for `new-order` events, `private-customer-<userId>` for `order-status-changed` events. **Private** channels (not public) because order data is sensitive — Pusher requires a server-side auth callback before a client can subscribe to a private channel, which is exactly the room-authorization boundary the original Socket.io design achieved with JWT-gated room joins.
- New route `POST /pusher/auth`, behind `validateUser()` (any authenticated user): Pusher's client SDK calls this with `socket_id` + `channel_name` on every subscribe attempt. The handler decodes the requested channel name, checks that the authenticated user actually owns the shopId (vendor) or userId (customer) encoded in it, and only then calls `pusherServer.authorizeChannel(socket_id, channel_name)` — reusing the existing JWT-verification logic from `validateUser` rather than inventing a parallel auth scheme. A mismatch (e.g. a vendor requesting another vendor's channel) is rejected.
- Emission points: `order.service.ts`'s order-creation function calls `pusherServer.trigger('private-vendor-' + shopId, 'new-order', {...})` after the Prisma write succeeds (not before — never emit on an operation that might still fail); `payment.service.ts`'s `successfullyPayment` (and any other order-status-changing path) calls `pusherServer.trigger('private-customer-' + userId, 'order-status-changed', {...})` after its `prisma.order.update` succeeds. Both calls are fire-and-forget — a Pusher API failure must never throw or block the HTTP response.

## Implementation

1. Create a free Pusher Channels app (Sandbox plan); get `appId`/`key`/`secret`/`cluster`.
2. Add `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` env vars, read via `src/app/config/index.ts`.
3. Add the `pusher` (server SDK) dependency.
4. `src/app/util/pusher.ts` — initializes and exports the `pusherServer` singleton.
5. New small route/controller — `POST /pusher/auth`, behind `validateUser()`, verifying channel ownership before calling `pusherServer.authorizeChannel(...)`; register it in `src/app/router/index.ts`.
6. `order.service.ts` — trigger `new-order` on `private-vendor-<shopId>` after successful order creation.
7. `payment.service.ts`'s `successfullyPayment` (and any admin/vendor order-status-update path in `order.service.ts`, if one exists) — trigger `order-status-changed` on `private-customer-<userId>` after the status write succeeds.

## Dependencies

None — additive, doesn't change existing HTTP behavior or response shapes. The client spec (`10`) depends on this landing first (needs the channel-naming scheme and the `/pusher/auth` endpoint).

## Verify

- Placing an order via the existing `POST /order` (or equivalent) endpoint results in a `new-order` event received only by a client that successfully authenticated (via `/pusher/auth`) for that order's shop's own vendor channel.
- A successful SSLCommerz payment callback results in an `order-status-changed` event received only by that order's own customer channel.
- A client attempting to subscribe to another vendor's or another customer's private channel is rejected by `/pusher/auth` (no cross-account leakage).
- Existing HTTP order/payment flows are unaffected — `yarn build`/`yarn lint` pass, and the trigger calls are fire-and-forget (a Pusher call failure must never throw or block the HTTP response).
- Works end-to-end on the actual Vercel deployment, since no persistent server-side connection is required — this was the entire point of the switch from Socket.io.
