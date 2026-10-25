# Delivery log

The iteration state is maintained in [iterations.md](iterations.md); this file records observed evidence only.

<a id="01--catalog-and-central-access-management"></a>
## 01 — Catalog and central access management

- Changes: generated `apps/damaca-hub` from `mongo-google`, then replaced its global user-grant flow with verified-identity catalog access and app-scoped requests/grants. Added an editable five-app seed catalog, gated preproduction links, pending/rejected/revoked states, admin review and grant/revoke actions, stable indexes, and safe Mongo integration coverage. Removed the unused starter's global `user_access` flow. Added the future OIDC boundary in [access-integration.md](../docs/access-integration.md); updated the monorepo inventory, shared lockfile, README and product instructions.
- Validation: `bun run type-check --filter=@damaca/damaca-hub` passes; `bun run test --filter=@damaca/damaca-hub` passes (17 tests, 37 expectations); `bun run test:generator` passes (6 tests, 37 expectations); `bun install --frozen-lockfile` passes; `git diff --check` passes. Explicit Biome check over the new app and edited docs reports no errors; it reports six warnings in copied starter modules/environment configuration. Mongo integration passes on temporary MongoDB 8 at loopback with a fresh, empty `damaca_hub_test_a1b2c3d4` database; it verified idempotent seeds, request races and reopens, stale decisions, per-app isolation, grant/revoke behavior and indexes. The test dropped only that database and the temporary container was stopped.
- Build: Turbopack's default build fails in this environment while binding its auxiliary port (`Operation not permitted`), including when rerun with escalation. The same production build passes with `next build --webpack` and disposable placeholder OAuth/Mongo environment values.
- Limits: no real Google OAuth credentials or configured callbacks were available, so the live sign-in flow was not exercised. Responsive layout and keyboardable native controls were source-reviewed; no authenticated browser session was available for an interactive visual review. Domains remain unset and the other five applications remain unintegrated, as scoped.

## Shared consumer integration AGW-05

The current human request authorizes mandatory Google authentication and Hub authorization for Pocha Score and Card Wars through the central Hub OIDC provider. This supersedes the previous delivery's exclusion of consumer integration. Google is configured only in Hub; consumers use independent OIDC clients and sessions. Primary status and evidence live in [root AGW-05](../../../plan/iterations.md#agw-05--google-identity-and-hub-access-shared-package) and [root delivery log](../../../plan/iteration-log.md#agw-05-google-identity-and-hub-access).
