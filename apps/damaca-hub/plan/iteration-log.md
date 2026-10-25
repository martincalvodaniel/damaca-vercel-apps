# Delivery log

The iteration state is maintained in [iterations.md](iterations.md); this file records observed evidence only.

<a id="01--catalog-and-central-access-management"></a>
## 01 — Catalog and central access management

- Changes: generated `apps/damaca-hub` from `mongo-google`, then replaced its global user-grant flow with verified-identity catalog access and app-scoped requests/grants. Added an editable five-app seed catalog, gated preproduction links, pending/rejected/revoked states, admin review and grant/revoke actions, stable indexes, and safe Mongo integration coverage. Removed the unused starter's global `user_access` flow. Added the future OIDC boundary in [access-integration.md](../docs/access-integration.md); updated the monorepo inventory, shared lockfile, README and product instructions.
- Validation: `bun run type-check --filter=@damaca/damaca-hub` passes; `bun run test --filter=@damaca/damaca-hub` passes (17 tests, 37 expectations); `bun run test:generator` passes (6 tests, 37 expectations); `bun install --frozen-lockfile` passes; `git diff --check` passes. Explicit Biome check over the new app and edited docs reports no errors; it reports six warnings in copied starter modules/environment configuration. Mongo integration passes on temporary MongoDB 8 at loopback with a fresh, empty `damaca_hub_test_a1b2c3d4` database; it verified idempotent seeds, request races and reopens, stale decisions, per-app isolation, grant/revoke behavior and indexes. The test dropped only that database and the temporary container was stopped.
- Build: Turbopack's default build fails in this environment while binding its auxiliary port (`Operation not permitted`), including when rerun with escalation. The same production build passes with `next build --webpack` and disposable placeholder OAuth/Mongo environment values.
- Limits: no real Google OAuth credentials or configured callbacks were available, so the live sign-in flow was not exercised. Responsive layout and keyboardable native controls were source-reviewed; no authenticated browser session was available for an interactive visual review. Domains remain unset and the other five applications remain unintegrated, as scoped.

<a id="02--match-hub-session-cookie-detection"></a>
## 02 — Match Hub session cookie detection

- Changes: configured the Hub proxy's `getSessionCookie` check with Better Auth's `damaca-hub` cookie prefix and added regression coverage for authenticated and unauthenticated requests.
- Validation: `bunx biome check apps/damaca-hub/src/proxy.ts apps/damaca-hub/src/proxy.test.ts apps/damaca-hub/plan/iterations.md apps/damaca-hub/plan/iteration-log.md` passes; `bun run type-check --filter=@damaca/damaca-hub` passes; `bun run test --filter=@damaca/damaca-hub` passes (24 tests, 71 expectations); `bun run build --filter=@damaca/damaca-hub` passes; `git diff --check` passes. Commit `ae7574c` is published on `origin/int`; Vercel deployment `6LpUgGtEYnHnyqQcCVBwvL8e42du` is Ready on the stable alias, and the browser shows the authenticated application catalog after Google login.
- Limits: Vercel reported remote build cache unavailable, so the deployment built without remote caching. No production or `main` changes were made.

<a id="03--improve-site-administration-navigation"></a>
## 03 — Improve site administration navigation

- Changes: removed the “Back to applications” control and the Settings-page administration link. Added a role-filtered Site administration item to the main navigation. Wrapped each application administration panel in a native `<details>` disclosure, collapsed by default with a keyboard-operable summary and visible disclosure indicator.
- Validation: Biome passes on the eight changed files; `bun run type-check --filter=@damaca/damaca-hub`, `bun run test --filter=@damaca/damaca-hub` (25 tests, 72 expectations), `bun run build --filter=@damaca/damaca-hub`, and `git diff --check` pass. The deployed `int` preview shows Site administration in the admin navigation, no “Back to applications” link, and all five application disclosures closed by default; opening one expands its controls. Settings has no administration link in its content. At 390 px, the navigation and content fit without horizontal overflow. The local dev server could not start because ports 3005 and 3015 were occupied; those existing processes were left untouched.
- Publication: feature commit `a8e5829` is on `origin/int` and its Vercel deployment is Ready. The plan/log status commit follows after the live preview review.

## Shared consumer integration AGW-05

AGW-05 temporarily integrated Pocha Score and Card Wars. AGW-08 supersedes that product decision; see the current [root delivery](../../../plan/iterations.md#agw-08--public-games-and-hub-managed-oidc-clients).
