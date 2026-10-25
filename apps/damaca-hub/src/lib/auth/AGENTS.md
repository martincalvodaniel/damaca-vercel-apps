# Authentication Rules

- `auth.ts` and `session.ts` are server-only. `auth-client.ts` is client-only. Keep pure helpers testable without importing server configuration.
- Better Auth authenticates Google identities and persists Hub users, accounts, sessions, OAuth records and signing keys through the native MongoDB adapter. Consumer sessions remain independent; the documented AGW-05 decision introduces this persistence and invalidates old stateless Hub cookies.
- Every verified Google identity may use the catalog and request per-application access. These identity-scoped routes use `getVerifiedSession()` and do not imply a grant to another application.
- `ALLOWED_EMAILS` is the sole source of Hub administrator membership. Resolve it on the server for every admin action and page. Never accept a client-supplied actor email or role.
- Application grants and requests are scoped by `appId` and normalized email in MongoDB. Validate every action input with shared Zod schemas and check the verified identity and administrator role inside each action; layouts and the proxy are not an authorization boundary.
- A pending request must be reviewed using its exact request UUID and app ID. Rejecting or revoking access must not let a stale request decision grant access later. Resubmission creates a fresh request UUID.
- Pocha Score and Card Wars are public and never use OIDC grants. Resolve private client metadata from the Mongo registry for each request. Never share cookies/session secrets or change unrelated applications.
- Better Auth's catch-all route owns protocol input validation. Keep application-owned forms and action inputs under shared Zod contracts.
- Read configuration through `src/config/env.ts`. Never log cookies, tokens, OAuth credentials, or actual allowed email addresses.
- Unit tests do not establish that a real Google OAuth flow works. Record manual or integration evidence separately when that flow changes.
- Keep post-login redirects internal through `getSafeCallbackUrl()` and cover accepted redirect behavior with regression tests.

## Superseded consumer access integration (AGW-05)

AGW-05 temporarily integrated Pocha Score and Card Wars. The owner reversed that decision in AGW-08; both games are public and offline. Keep Google sign-in centralized in Hub and resolve managed private OIDC clients dynamically. Never accept a browser's email as an authenticated identity.
