# Build Plan

Unlike a greenfield project, `reiment-l2-server` is already built and in active use — there is no historical unit-by-unit build sequence to record here.

This file exists so future backend feature work can be planned the same way: when a new feature is scoped, add a numbered spec file here (`01-<feature-name>.md`, `02-<feature-name>.md`, ...) describing its goal, design, and implementation steps. List them below as they're added.

These specs are adapted summaries of the repo's root-level implementation-plan docs (`implementationplan.md`, `coupon-implementation-plan.md`, `followed-shops-filter-implementation-plan.md`), which remain the detailed, checkbox-driven source of truth — keep both in sync rather than letting the spec drift from the root doc's checklist state.

## Units

1. **[01: AI Integration](./01-ai-integration.md)** — the `ai` module: vendor description generation, public shopping chat, public smart search, all via the shared `askOpenRouter` client. Implemented; see root `implementationplan.md`.
2. **[02: Coupon Feature](./02-coupon-feature.md)** — date-range validity, atomic usage-limit enforcement, per-user one-time-use, and fixing the `cuponId`/`couponId` mismatch that currently makes the discount a no-op in production. Not yet implemented.
3. **[03: Followed Shops Product Filter](./03-followed-shops-filter.md)** — add a `shopIds` filter to `GET /product/all-products` so the client can offer an "Only shops I follow" toggle, plus a `totalItems` count-consistency fix. Plan written, awaiting user review/approval before implementation.
4. **[04: Backend Testing](./04-backend-testing.md)** — Jest + Supertest integration tests for the coupon, follower, and auth modules against a real test database. No test suite exists today. Plan written, awaiting user review/approval before implementation.
5. **[05: Backend CI Pipeline](./05-ci-pipeline-backend.md)** — GitHub Actions workflow with an ephemeral Postgres service, running lint/build/migrate/test. Depends on spec `04` landing first. Plan written, awaiting user review/approval before implementation.
6. **[06: Real-Time Order Notifications (Backend)](./06-realtime-notifications-backend.md)** — Pusher server emitting `new-order`/`order-status-changed` events. Candidate "depth" feature (alternative: spec `07`). Pairs with the client repo's spec `10`. Implemented.
7. **[07: Payment Module Hardening](./07-payment-module-hardening.md)** — type the SSLCommerz webhook payload, add an idempotency guard against duplicate webhook calls, evaluate `val_id` server-side validation. Candidate "depth" feature (alternative: spec `06`). Plan written, awaiting user review/approval before implementation.
8. **[08: Backend Code-Quality Cleanup](./08-backend-code-quality-cleanup.md)** — replace remaining `any` signatures with typed interfaces (outside `payment/`, covered by spec `07`), remove the unused `bcrypt` dependency. Plan written, awaiting user review/approval before implementation.
9. **[09: Dockerize the API + docker-compose](./09-dockerization.md)** — `Dockerfile` for the API plus a `docker-compose.yml` bringing up Postgres + API + client (client's own `Dockerfile` from the client repo's spec `12`). Plan written, awaiting user review/approval before implementation.
10. **[10: Fix `couponId` Null Validation Bug](./10-order-coupon-null-validation-bug.md)** — checkout without a coupon sends `couponId: null`, which the Zod schema rejects (only accepts `string | undefined`). One-line fix: `.optional()` → `.nullish()`. Implemented.
