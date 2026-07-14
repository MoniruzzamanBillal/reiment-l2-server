# 05: Backend CI Pipeline

Status: 📝 Planned, awaiting user review/approval. No code changed yet. Depends on spec `04` (backend testing) landing first.

## Goal

Add a GitHub Actions workflow running lint, build, and test on every push/PR — the backend counterpart to the client's spec `09`.

## Context

No CI config exists in this repo today. Unlike the client, `yarn test` here needs a real Postgres instance to run against (per spec `04`'s design), so this workflow is slightly more involved than the client's: it needs a database service, not just a Node runtime.

## Design

Use GitHub Actions' built-in `services:` support to spin up a throwaway Postgres container for the job's lifetime, run `prisma migrate deploy` (or `db push`) against it, then run the existing `lint` → `build` → `test` sequence.

## Implementation

1. `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     verify:
       runs-on: ubuntu-latest
       services:
         postgres:
           image: postgres:16
           env:
             POSTGRES_USER: test
             POSTGRES_PASSWORD: test
             POSTGRES_DB: reiment_test
           ports: ["5432:5432"]
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
       env:
         DATABASE_URL: postgresql://test:test@localhost:5432/reiment_test
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: yarn
         - run: yarn install --frozen-lockfile
         - run: npx prisma migrate deploy
         - run: yarn lint
         - run: yarn build
         - run: yarn test
   ```
2. Add a CI status badge to `reiment-l2-server/README.md`.

## Dependencies

Hard dependency on spec `04` (backend testing) — `yarn test` must be a real, passing command first. Uses the same Postgres-in-CI pattern that spec `09`'s local `docker-compose.yml` also relies on, so it's worth keeping the schema/seed approach consistent between the two.

## Verify

- A PR with a failing test or lint error shows a red CI check.
- A clean PR shows all steps green, including a successful `prisma migrate deploy` against the ephemeral CI database.
