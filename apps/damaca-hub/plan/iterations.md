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

AGW-05 temporarily integrated Pocha Score and Card Wars. AGW-08 supersedes that decision; the games are public and offline. Hub-managed OIDC clients remain available for existing private apps. See [root AGW-08](../../../plan/iterations.md#agw-08--public-games-and-hub-managed-oidc-clients).

## 02 — Match Hub session cookie detection

- Status: `validated`.
- Goal: make the Hub proxy recognize the session cookie configured by its Better Auth instance so authenticated preview users do not enter a sign-in redirect loop.
- Paths: `src/proxy.ts`, `src/proxy.test.ts`, this plan, and the delivery log.
- Dependencies: Better Auth exposes a cookie-prefix option for `getSessionCookie`; Google OAuth callback allowlist includes the stable `int` origin and callback.
- Acceptance: authenticated requests carrying the `damaca-hub` session cookie pass the proxy; unauthenticated requests still redirect to sign-in; Google login on the stable `int` alias completes and returns to the catalog.
- Validation: focused proxy tests, Hub lint/type-check/tests/build, and authenticated catalog on the deployed `int` alias.
- Evidence: [delivery log](iteration-log.md#02--match-hub-session-cookie-detection).

## 03 — Improve site administration navigation

- Status: `validated`.
- Goal: place administrator access in the main navigation and make each application section collapsible.
- Paths: `src/components/shared/**`, `src/features/admin/components/admin-screen.tsx`, `src/features/admin/components/application-admin-card.tsx`, `src/features/settings/components/settings-screen.tsx`, and this plan/log.
- Dependencies: existing admin role check and application administration cards.
- Acceptance: remove the “Back to applications” link; hide the administration link from Settings; show Site administration in the main nav for admins only; render each application collapsed by default and expandable with an accessible native disclosure control.
- Validation: Hub Biome, type-check, tests, build, desktop/mobile browser review, and `git diff --check`.
- Evidence: [delivery log](iteration-log.md#03--improve-site-administration-navigation).

## 04 — Keep administrator application grants explicit

- Status: `validated`.
- Goal: allow Hub administrators to grant or revoke application access for administrator accounts while retaining explicit per-application authorization.
- Paths: `src/features/hub/actions.ts`, `src/features/admin/components/admin-screen.tsx`, this plan, and the delivery log.
- Dependencies: existing `ALLOWED_EMAILS` administrator check and MongoDB per-app grant store.
- Acceptance: only verified Hub administrators can manage grants; administrators can receive and lose a grant for an individual private app; administrator membership never bypasses OIDC app-grant checks; public games remain ungrantable; admin-facing text explains the distinction.
- Validation: Hub Biome, type-check, tests, production build, and `git diff --check`; publish to `int` and verify the explicit Tasks grant through Site administration.
- Evidence: [delivery log](iteration-log.md#04--keep-administrator-application-grants-explicit).
