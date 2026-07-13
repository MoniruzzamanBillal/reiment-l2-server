# 08: Backend Code-Quality Cleanup

Status: 📝 Planned, awaiting user review/approval. No code changed yet. Deliberately sequenced after testing (spec `04`) so type-tightening changes have a safety net.

## Goal

Replace remaining `any` usages in service/controller signatures (payment's `payload: any` is covered separately in spec `07` since it's paired with a real correctness fix; this spec covers the rest) with typed payloads/interfaces, following each module's existing `.interface.ts` convention.

## Context

The module convention already has a dedicated place for this (`<name>.interface.ts`) — this is filling in gaps against an existing pattern, not introducing one. `bcrypt` is also listed as an unused dependency in `package.json` (its import is commented out in `auth.service.ts` in favor of `argon2`, per `progress-tracker.md`'s "Known Gaps") — small, safe removal, bundled here since it's the same "tidy up loose ends" pass.

## Design

Grep every module for `: any` in function signatures (excluding `payment`, covered by spec `07`, and excluding any `any` that's genuinely load-bearing, e.g. typing a third-party callback shape not worth modeling). For each real hit, add or extend the module's `<name>.interface.ts` with a proper type and update the signature — mechanical, one module at a time, verified with `yarn build` after each.

## Implementation

1. Grep `src/app/modules/**/*.service.ts` and `*.controller.ts` for `: any`; enumerate real candidates module by module (likely candidates beyond payment: any module whose service function takes a loosely-typed `data`/`payload` param instead of importing its own `.interface.ts` type, if such cases exist — confirm by grep rather than assuming).
2. For each candidate, add/extend `<module>.interface.ts` and update the function signature.
3. Remove the unused `bcrypt` dependency from `package.json` (confirm via grep that no remaining import references it, not just the one already-commented-out spot in `auth.service.ts`).
4. `yarn lint` / `yarn build` after each module's change.

## Dependencies

Soft dependency on spec `04` (backend testing) — safety net for behavioral regressions, not a hard blocker.

## Verify

- `yarn build` passes with zero new type-checking suppressions.
- `grep -rn ": any" src/app/modules/ --include=*.service.ts --include=*.controller.ts` returns nothing (or only justified, commented exceptions) outside `payment/` (handled by spec `07`).
- `yarn build` / `yarn dev` still starts cleanly after removing `bcrypt` from `package.json`.
