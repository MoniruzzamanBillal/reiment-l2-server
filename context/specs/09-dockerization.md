# 09: Dockerize the API + docker-compose for the Full Stack

Status: 📝 Planned, awaiting user review/approval. No code changed yet. Owns the shared `docker-compose.yml`; pairs with `reiment-l2-client/context/specs/12-dockerization.md`, which owns the client's own `Dockerfile`.

## Goal

Add a `Dockerfile` for the API and a `docker-compose.yml` that brings up Postgres + the API + the client with one command, for a reproducible local dev environment and a concrete, demonstrable "containerized this project" line for a resume.

## Context

Neither repo has a `Dockerfile` or `docker-compose.yml` today. This repo owns the compose file (rather than the client, or a third top-level location) because the Postgres dependency and `DATABASE_URL`/`prisma migrate` sequencing originate here — the client's `Dockerfile` (spec `12` in that repo) is referenced from this compose file via a relative build context, relying on the two repos being checked out as sibling directories (already true in this workspace, per the top-level `CLAUDE.md`'s repository-layout description).

## Design

- API `Dockerfile`: multi-stage (`deps` → `builder` running `tsc` + `prisma generate` → slim `runner` running `node dist/server.js`), since `postinstall` already runs `prisma generate` per the existing `package.json` script.
- `docker-compose.yml`: three services — `postgres` (official `postgres:16` image, named volume for persistence), `server` (this repo's `Dockerfile`, depends on `postgres` being healthy, runs `npx prisma migrate deploy` on startup before `node dist/server.js` — via an entrypoint script, not baked into the image build, since migrations should run against whatever DB the container connects to at runtime, not at build time), `client` (built from `../reiment-l2-client`'s `Dockerfile` per that repo's spec `12`, with `NEXT_PUBLIC_API_BASE_URL` pointed at the `server` service).
- `.env`-driven config for the compose file (DB credentials, JWT secrets, OpenRouter API key) via a `.env.example` documenting every required variable, matching `config/index.ts`'s existing role as the single place env vars are read.

## Implementation

1. `Dockerfile` (multi-stage: deps → builder → runner).
2. `docker-entrypoint.sh` (or inline compose `command:`) running `npx prisma migrate deploy && node dist/server.js`, so the container always starts against a migrated schema.
3. `.dockerignore` (`node_modules`, `dist`, `.git`).
4. `docker-compose.yml` at the repo root, with `postgres`, `server`, and `client` services as described above.
5. `.env.example` listing every variable `docker-compose.yml` and `config/index.ts` expect.
6. `README.md` — add a "Run with Docker" section: `docker-compose up`, one command, done.

## Dependencies

Coordinates with `reiment-l2-client/context/specs/12-dockerization.md` for the client service's build context. Benefits spec `04` (backend testing) and spec `05` (backend CI) by providing a consistent, disposable local/CI Postgres pattern, though those specs can also stand alone with a plain `postgres:16` service without the full compose stack.

## Verify

- `docker-compose up` from a clean checkout (both repos as sibling directories) brings up all three services with no manual steps beyond populating `.env`.
- The containerized client can reach the containerized server, and the server can reach the containerized Postgres and has a migrated schema.
- Killing and restarting the stack (`docker-compose down && docker-compose up`) preserves data (named volume for Postgres) and doesn't re-run migrations destructively.
