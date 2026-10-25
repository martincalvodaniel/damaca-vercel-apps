# Product iterations

This file is the sole source of iteration status. Follow the [root workflow](../../../plan/workflow.md).

## 01 — Catalog and central access management

- Status: `validated`.
- Goal: deliver the authenticated application directory, editable MongoDB catalog, and per-app access request and administration flows; document the future SSO boundary.
- Paths: `apps/damaca-hub/**`, root `README.md`, `docs/monorepo.md`, `docs/turbopack.md`, `docs/deployment-and-caching.md`, and root `plan/master.md`.
- Dependencies: accepted Damaca Hub product plan from the human owner; MongoDB and Google OAuth environment credentials for live integration verification.
- Acceptance: verified Google identities can access the catalog and request app-specific access; admins can edit catalog entries and resolve requests, grant and revoke access; production links appear to authenticated users and preproduction links only to admins/currently authorized users; stale and duplicate requests cannot override current state; seeds are idempotent and preserve edits; failures deny authorization and provide recoverable UI; no other app's access behavior changes; future OIDC boundaries are documented without implementation.
- Validation: focused unit and repository tests including MongoDB integration tests with isolated resources where available; lint, type-check, and production build filtered to Damaca Hub; verify documentation links, responsive/keyboard UI, and `git diff --check`. Record unavailable external credentials or services as blocked checks, not passes.
- Evidence: [iteration-log.md#01--catalog-and-central-access-management](iteration-log.md#01--catalog-and-central-access-management).

## Shared consumer integration AGW-05

The current human request authorizes mandatory Google authentication and Hub authorization for Pocha Score and Card Wars through the central Hub OIDC provider. This supersedes the previous delivery's exclusion of consumer integration. Google is configured only in Hub; consumers use independent OIDC clients and sessions. Primary status and evidence live in [root AGW-05](../../../plan/iterations.md#agw-05--google-identity-and-hub-access-shared-package) and [root delivery log](../../../plan/iteration-log.md#agw-05-google-identity-and-hub-access).
