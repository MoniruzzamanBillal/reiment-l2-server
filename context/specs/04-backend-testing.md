# 04: Backend Testing (Jest + Supertest)

Status: 📝 Planned, awaiting user review/approval. No code changed yet.

## Goal

Add an automated test suite — `package.json`'s `"test"` script is currently `"echo \"Error: no test specified\" && exit 1"` and no `*.test.*`/`*.spec.*` files exist anywhere in the repo. This is the backend half of the highest-signal item for a mid-level application.

## Context

Highest-value targets, chosen because they carry real, previously-buggy business logic rather than thin CRUD wrappers:

- **Coupon** (`modules/coupon/`) — date-range validity, atomic `usedCount` + `CouponUsage` per-user enforcement inside `order.service.ts`'s `$transaction` (per `02-coupon-feature.md`, already fixed once from a broken state — exactly the kind of logic a regression test should guard).
- **Follower** (`modules/follower/`) — follow/unfollow, including the exact `req.body.shopId` contract that was the source of the 404 bug fixed in the client's spec `06`; a controller-level Supertest here would have caught that mismatch before it shipped.
- **Auth** (`modules/auth/`) — JWT issuance and refresh-token flow (`argon2` password hashing).

## Design

- Jest + `ts-jest` (or `swc`-based Jest config, whichever integrates more cleanly with the existing `tsc` build) + Supertest for HTTP-level integration tests against the real Express app (`app.ts`), not a mocked one — the module convention (`route` → `controller` → `service` → Prisma) is thin enough that testing through the route layer exercises real behavior, including `validateRequest`/`validateUser` middleware.
- Use a real test Postgres database (a local Docker container, matching spec `09`'s dockerization work, or a separate Neon branch) rather than mocking `prisma` wholesale — mocking Prisma for a coupon-usage race-condition test in particular would test the mock, not the actual `$transaction`/unique-constraint behavior that made the real bug fixable.
- Seed/teardown per test file via Prisma directly (`beforeAll`/`afterAll`), following whatever minimal seed each suite needs — no shared global fixture file needed at this scale.

## Implementation

1. Add dev dependencies: `jest`, `ts-jest` (or equivalent), `@types/jest`, `supertest`, `@types/supertest`.
2. `jest.config.ts` — ts-jest preset, test environment `node`, pointing at a separate test database URL (via a `.env.test` or `DATABASE_URL` override, added to `config/index.ts`'s config surface per the existing "config is the only place env vars are read" convention).
3. `src/app/modules/coupon/__tests__/coupon.test.ts` — date-range rejection, usage-limit exhaustion, per-user duplicate-use rejection (the exact scenarios `coupon-implementation-plan.md` was written to fix).
4. `src/app/modules/follower/__tests__/follower.test.ts` — follow, duplicate-follow rejection, unfollow via `{ shopId }` body (locking in spec `06`'s client-side contract from the server side).
5. `src/app/modules/auth/__tests__/auth.test.ts` — register, login, invalid-credentials rejection, refresh-token flow.
6. `package.json` — replace the `"test"` stub with `"test": "jest"`.

## Dependencies

None for the test suite itself. Benefits from (but doesn't require) spec `09`'s dockerized Postgres, which gives a disposable local test database instead of relying on the shared dev DB.

## Verify

- `yarn test` runs the full suite and passes against a real (test) database.
- Deliberately reverting the `couponId` fix or the follower `req.body.shopId` contract makes the corresponding test fail — proving these are regression guards, not vacuous assertions.
- CI (spec `05`) runs this suite on every push once a test database is available in that environment.
