# Build Plan

Unlike a greenfield project, `reiment-l2-server` is already built and in active use — there is no historical unit-by-unit build sequence to record here.

This file exists so future backend feature work can be planned the same way: when a new feature is scoped, add a numbered spec file here (`01-<feature-name>.md`, `02-<feature-name>.md`, ...) describing its goal, design, and implementation steps. List them below as they're added.

These specs are adapted summaries of the repo's root-level implementation-plan docs (`implementationplan.md`, `coupon-implementation-plan.md`, `followed-shops-filter-implementation-plan.md`), which remain the detailed, checkbox-driven source of truth — keep both in sync rather than letting the spec drift from the root doc's checklist state.

## Units

1. **[01: AI Integration](./01-ai-integration.md)** — the `ai` module: vendor description generation, public shopping chat, public smart search, all via the shared `askOpenRouter` client. Implemented; see root `implementationplan.md`.
2. **[02: Coupon Feature](./02-coupon-feature.md)** — date-range validity, atomic usage-limit enforcement, per-user one-time-use, and fixing the `cuponId`/`couponId` mismatch that currently makes the discount a no-op in production. Not yet implemented.
3. **[03: Followed Shops Product Filter](./03-followed-shops-filter.md)** — add a `shopIds` filter to `GET /product/all-products` so the client can offer an "Only shops I follow" toggle, plus a `totalItems` count-consistency fix. Plan written, awaiting user review/approval before implementation.
