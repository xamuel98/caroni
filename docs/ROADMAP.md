# Caroni — Roadmap & Status

> Living document. Update the **Status** column and "Where we are" as milestones land.
> Task-level source of truth: [`tasks/board.yaml`](../tasks/board.yaml) (synced to GitHub Issues/Projects).

## What the project is

A **virtual-money platform** with two surfaces sharing one authorization spine:

- **consumer-portal** — end users: send money by tag, wallet, KYC, team/beneficiaries.
- **ops-console** — staff: KYC queue, failed/held transfers, disputes, holds, audit, role/branch admin.
- **api** — the BFF / domain service (NestJS).
- **OPA** — the policy decision point. The differentiator is **RBAC → ABAC → PBAC** on one flow.
- **ThunderID** — OIDC identity provider for staff.
- **Postgres** — data, sessions, audit log.

## How the pieces connect

```
 browser ──cookie──▶ ops-console / consumer-portal (React + design-system UI)
                            │  X-Correlation-Id, session cookie
                            ▼
                     api (BFF / NestJS)
        ┌───────────────┼───────────────────────────┐
        ▼               ▼                            ▼
   session store   @RequirePermission ──▶ PolicyService ──▶ OPA (PDP: rbac → abac → pbac)
   (Postgres)            │                    │
                         └── 403 reasons/obligations      └──▶ decision_log (audit)
                                      │
                              domain handlers ──▶ Postgres (ledger, cases…)
   shared-types (zod contracts) ⇄ api ⇄ both apps      design-system ⇄ both apps
```

**The through-line:** every action is a permission decision. `@RequirePermission('…')` → the
guard builds an OPA input from the verified session → OPA answers allow/deny (+ reasons/obligations)
→ `decision_log` records it. Later, the UI mirrors the same decisions via **abilities** (so it can
hide/disable), but the **server is always the source of truth**.

## Milestones

| # | Milestone | Purpose | Status |
|---|---|---|---|
| **M0** | Spike & Foundations | Prove the risky integrations work | ✅ done |
| **M1** | Vertical slice | Real sessions, staff login, abilities, ops shell, first deploy | 🔶 ~half |
| M2 | Transfer happy path | Double-entry ledger, idempotency, history | ⬜ backlog |
| M3 | KYC & tiers | Verification → tier → ABAC limits; the "held → verify → complete" spine demo | ⬜ |
| M4 | Exceptions | Held/failed → cases, resolve/retry/reverse, dual-control (four-eyes) | ⬜ |
| M5 | Policy depth | Full Rego rbac/abac/pbac + authorization-matrix suite + role editor | ⬜ |
| M6 | Real-time & audit | SSE streams, audit UI | ⬜ |
| M7 | Multi-tenancy | Branch scoping, per-branch policy, isolation tests | ⬜ |
| M8 | Polish & deploy | Design-system completion, a11y, perf, CI, prod | 🔶 (design system built early) |
| M9 | Portfolio layer | README, demo video, write-up, seed data | ⬜ |

## What's implemented

### M0 — Foundations (complete)

- **M0-1** pnpm + Turborepo monorepo: `apps/{api,consumer-portal,ops-console}`,
  `packages/{design-system,shared-types}`; root `lint / typecheck / test / build`.
- **M0-2** `infra/docker-compose.yml` — Postgres + OPA *(api/thunder not containerized yet)*.
- **M0-3** NestJS skeleton, **zod-validated env** (fails fast), `/health` (probes OPA + Postgres → 503).
- **M0-4** OPA + `caroni/allow` + `caroni/rbac` policies → `PolicyService`.
- **M0-5 / M0-6** ThunderID OIDC (PKCE) proven end-to-end: login → decision → gated access
  *(dev-only tweak: the generated flow skips forced email-MFA)*.
- **M0-7** `@caroni/shared-types` — zod contracts for `Session`, `Ability`/`AbilitiesResponse`, `Transfer`
  *(ESM-only; CJS dual-build pending)*.
- **Design system (built early, maps to M8-1/M8-2):** 45+ components + Storybook + tokens/motion.

### M1 — Vertical slice (in progress)

- **M1-1** BFF session model ✅ — server-side store (in-memory + Postgres), HttpOnly/SameSite/Secure
  cookies, expiry enforcement + janitor, rotation on login *(CSRF double-submit still open)*.
- **M1-2** Staff OIDC login ✅ — authorize/callback/token exchange; **`id_token` verified**
  (JWKS, iss/aud/nonce/exp).
- **M1-5** Guard + decisions ✅ — `@RequirePermission()`, 403 with reasons/obligations, and a
  **`decision_log`** audit row per decision.
- **M1-3** consumer OTP login ⬜ · **M1-4** `GET /api/session/abilities` ⬜ ·
  **M1-6** ops-console shell ⬜ · **M1-7** deploy ⬜.

**Cross-cutting (from the M1 hardening pass):** RFC 7807 problem+json, typed domain errors,
`X-Correlation-Id`, helmet/CORS, graceful shutdown, Nest `Logger`, forward-only migration runner,
and 47 API tests (including an OPA authorization-matrix integration test).

## Where we are

**M0 complete; roughly half of M1.** The **auth + authorization spine is production-shaped**
(verified identity, durable sessions, policy guard, audit trail). The frontend apps are still
Vite stubs.

### Next

1. **M1-4** — abilities contract: catalogue compiler (`permission-glossary.csv` + `roles.yaml`) →
   `GET /api/session/abilities` (plus the **M0-7** shared-types dual-build).
2. **M1-6** — ops-console shell: login → session → abilities, `RequireAbility` route guard,
   permission-filtered nav.
3. **M1-3** consumer OTP login · **M1-7** first deploy.

## Known gaps (deliberately deferred)

- CSRF double-submit tokens for mutations.
- `decision_log` retention / partitioning.
- Abilities compile + `role_permissions` push to OPA on change (M5-5).
- ThunderID email-MFA provider (removes the dev workaround).
- api + ThunderID not yet in compose; no CI workflow yet (M8-7).

## Branching model

- `dev` — integration branch. Feature branches are cut from `dev` and merged back into it.
- `staging` — promotion from `dev`.
- `production` — promotion from `staging`.
- `main` — original trunk (kept for history; not part of the promotion flow).
