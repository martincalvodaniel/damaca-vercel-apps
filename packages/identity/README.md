# Shared Hub identity

`@damaca/identity` provides the Hub OIDC provider and reusable Next.js consumer integration. Google credentials exist only in Damaca Hub. Pocha Score and Card Wars require Google identity and a current grant for their own application. Other applications retain their existing authentication.

```mermaid
sequenceDiagram
  participant App as Consumer app
  participant Hub as Damaca Hub
  participant Google
  App->>Hub: OIDC authorization code + state, nonce, S256 PKCE
  Hub->>Google: Sign in (only when needed)
  Google-->>Hub: Verified identity
  Hub-->>App: One-time authorization code
  App->>Hub: Code + verifier + confidential client credentials
  Hub-->>App: Signed ID token, access and refresh tokens
  App->>App: Validate signature, issuer, audience, nonce; create own session
  App->>Hub: UserInfo with access token
  Hub->>Hub: Read current app grant and active catalog entry
  Hub-->>App: Verified identity + app-specific permission
```

## Configure Hub

1. Configure MongoDB, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and administrators using [Hub's environment example](../../apps/damaca-hub/.env.example). Google registers only `${HUB_ORIGIN}/api/auth/callback/google`.
2. Set `HUB_OIDC_CLIENTS` to a JSON array of `{ appId, clientId, clientSecret, redirectUri }`. Use one client for each app/environment; client IDs, secrets (at least 32 random characters) and callbacks must be unique. Callback URLs match exactly, use HTTPS except localhost, and end in `/api/auth/callback/damaca-hub`. No wildcards or dynamically generated preview domains. The production Hub authorizes both production and preproduction consumer clients. The int Hub and database remain isolated for tests.
3. `appId` must match an existing active catalog app. Grant that application explicitly in Hub. Administrator membership does not imply an app grant.
4. Hub now persists users, accounts, sessions, verification/code records, encrypted signing keys and OAuth token records using the native MongoDB Better Auth adapter. Registered client metadata is resolved from configuration on each lookup; dynamic registration and client CRUD are disabled. No per-consumer MongoDB setup is required.
5. Existing stateless Hub cookies are invalidated through a new cache version and cookie namespace: sign in again once. Indexes are registered in Hub's normal index registry, including expiry cleanup. Run the Hub index task in your authorized environment before rollout. No existing grants or local game records are migrated.

## Configure a consumer

Copy that app's `.env.example` to its own untracked `.env.local` and supply:

| Variable                   | Purpose                                                   |
| -------------------------- | --------------------------------------------------------- |
| `BETTER_AUTH_URL`          | Exact consumer origin; no path or trailing slash          |
| `BETTER_AUTH_SECRET`       | Independent session secret, at least 32 random characters |
| `DAMACA_HUB_URL`           | Hub origin; production Hub for deployed consumers         |
| `DAMACA_HUB_CLIENT_ID`     | Client registered in Hub for this environment             |
| `DAMACA_HUB_CLIENT_SECRET` | That client's independent secret                          |

Both apps use the shared factory in their small `src/lib/auth/identity.ts` adapters. Session cookies use app-specific names, remain host-only, and are never shared with Hub. The encrypted account cookie retains OAuth tokens for stateless consumer sessions and renewal; no tokens are stored in IndexedDB or exposed in product UI. Server Components only read the encrypted account cookie. When renewal is needed they redirect to `/auth/refresh`; that Route Handler and the browser access-check Route Handler perform token rotation so updated cookies reach the browser. The internal account reader is server-only and is not exposed through the auth HTTP router. Session logout is local to the app. To change the Google account, switch it in Hub before signing in again. Removing the Hub session invalidates its delegated access tokens; grants are independently checked on every access.

Consumers use discovery at `/api/auth/.well-known/openid-configuration`, with required signed ID-token verification, S256 PKCE and nonce binding. Access/ID tokens last five minutes; refresh uses the Hub session. Authorization codes expire after one minute and cannot be reused. Signing keys rotate after 30 days with a one-day verification grace period. A running consumer may reject a just-rotated unknown key during JOSE's 30-second refresh cooldown; retry sign-in after that interval. Never remove previous keys before grace expires or rotate the encryption/session secret without a deliberate reauthentication plan.

## Access and local data

Every product page/layout checks identity and live Hub UserInfo server-side. UserInfo derives the app from the validated token's registered client, never from browser input. Unknown clients, expired/revoked tokens, inactive apps, missing/revoked grants, malformed responses and Hub/network/database failures all deny product access. Five-second HTTP timeouts bound the server check. The browser also checks on navigation, focus, visibility, pageshow and every 60 seconds while visible; an offline event locks the UI immediately. An already-open online view can remain visible for up to one poll interval plus the request timeout after a remote revocation.

This controls the supported app flow, not direct access to records already stored on a user's device. IndexedDB data is neither encrypted nor partitioned by account. Signing out, switching accounts and worker updates never erase it. Export JSON backups using the existing app controls. Authentication adds no backup or sync.

Static export is withdrawn: deploy each app as a Next.js server, with its root directory unchanged. The network-only service worker deletes only the app's legacy shell caches on activation and never stores protected HTML/RSC/API responses. Already distributed offline copies cannot be revoked before reconnecting and reloading the new version. Native installation remains supported; offline product use is unavailable. Keep HTTPS/root-origin hosting, do not configure public CDN caching for protected routes, and ensure your host revalidates `sw.js`.

Hub's Vercel geography rule still covers human navigation and Google callbacks. Discovery, JWKS, token, UserInfo, introspection and revocation endpoints are excluded so consumer servers in `cdg1` can reach them; protocol authentication remains required. Verify this routing on an authorized deployed environment. Do not spoof Vercel geography headers.

## Validation

From the repository root:

```bash
bun run type-check --filter=@damaca/identity --filter=@damaca/pocha-score --filter=@damaca/card-wars --filter=@damaca/damaca-hub
bun run test --filter=@damaca/identity --filter=@damaca/pocha-score --filter=@damaca/card-wars --filter=@damaca/damaca-hub
bun run build --filter=@damaca/pocha-score --filter=@damaca/card-wars --filter=@damaca/damaca-hub
```

The package integration tests run actual Hub and consumer protocol handlers over isolated HTTP servers with a seeded test identity and in-memory auth adapter. They do not contact Google or prove deployed MongoDB persistence. [UserInfo OpenAPI](docs/userinfo.openapi.yaml) defines consumer authorization, and the [Postman simulation](../../postman/simulations/identity.context.md) exercises the real HTTP client against contract responses and failures.

Before rollout, validate Google sign-in, a second app reusing the Hub login, separate production/int callbacks, MongoDB persistence across restarts, denial/revocation, and the legacy worker update with the actual domains and configured credentials. Unit, HTTP and browser fixture tests are separate evidence from live OAuth and native installation.

Sources: [Better Auth OAuth provider](https://better-auth.com/docs/plugins/oauth-provider), [Generic OAuth](https://better-auth.com/docs/plugins/generic-oauth), [Google server verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
