# AI Workflow Rules

## Overall Approach

This is a live, already-built codebase — the priority is making correct, minimally-invasive changes that fit the existing five-file module pattern, not re-architecting. Work one endpoint/feature at a time and verify before moving on.

## Scoping Rules

1. **Follow the existing module split.** A new endpoint gets `route`/`controller`/`service`/`validation`/`interface` files matching the pattern in `context/architecture.md`, inside `src/app/modules/<name>/`. Don't invent a different structure for a new module.
2. **No speculative changes.** Don't refactor unrelated modules, don't "clean up" the intentionally-misspelled `isDelated` field, don't add scaffolding for hypothetical future features.
3. **Don't add new core libraries/patterns without asking** — e.g. a different validation library instead of Zod, a different ORM, a different auth scheme, a testing framework. The stack in `context/architecture.md` is intentional.
4. **Two-repo changes are two edits.** A feature spanning both repos (e.g. the coupon fix, the followed-shops filter) needs its own plan/spec in each repo; check `git status` in the correct directory before committing either half. The frontend plan for a shared feature typically depends on this repo's half landing first — sequence backend before frontend.

## Handling Missing Requirements

- If a request/response payload shape isn't specified, check the corresponding frontend `types/index.ts` in `reiment-l2-client` and how the axios/`useApi.ts` consumer actually calls the endpoint before guessing — the frontend is the source of truth for the actual wire format in use, given there's no shared type layer.
- If an edge case is ambiguous (e.g. what happens to a coupon mid-checkout when its usage limit is hit concurrently), stop and ask rather than guessing the business rule.

## Protected / Sensitive Areas

- `src/app/config/index.ts` — its shape is read from many modules; changing a key name is a breaking change across the codebase.
- `src/app.ts` — CORS origin allowlist and the middleware/error-handler ordering (`globalErrorHandler` must stay after routes, before the 404 handler). Don't reorder without understanding why.
- `src/app/router/index.ts` — the list of registered module routers; new modules must be added here to be reachable.
- `prisma/schema.prisma` — soft-delete field spelling (`isDelated` on some models) is intentional/existing, not a bug to fix; schema changes need a migration (`npx prisma migrate dev`), never a hand-edited DB.
- Never call OpenRouter directly, bypassing `askOpenRouter` — it's the one place the fallback-model list and error handling live.

## Documentation Sync

- If an implementation decision changes something documented in `architecture.md` or `code-standards.md` (a new module, a new invariant, a resolved gap), update that file in the same change.
- Update `context/progress-tracker.md` after each meaningful change.
- Root-level plan docs (`implementationplan.md`, `coupon-implementation-plan.md`, `followed-shops-filter-implementation-plan.md`) are the detailed, checkbox-driven source of truth for pending/completed cross-cutting features — keep `context/specs/` and `context/progress-tracker.md` in sync with their checkbox state rather than duplicating and drifting from them.
- **Spec status tracking:** before starting implementation of any `context/specs/*.md` file, mark it **In Progress** in `progress-tracker.md`'s "Spec Implementation Status" table; mark it **Complete** once implemented and verified.

## Verification Checklist Before Moving On

- [ ] `yarn build` (TypeScript compile) succeeds.
- [ ] `yarn lint` is clean (no new errors/warnings).
- [ ] New/changed endpoints manually verified via `yarn dev` + curl/Postman against the expected request/response shape.
- [ ] If the change affects auth/role gating, confirm the correct `validateUser(...roles)` is applied.
- [ ] If the change touches a public/abuse-prone endpoint, confirm rate limiting is in place following the `ai.route.ts` pattern.
