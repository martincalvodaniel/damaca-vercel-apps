# Authentication Rules

- `auth.ts` and `session.ts` are server-only. `auth-client.ts` is client-only. Keep pure helpers testable without importing server configuration.
- Better Auth authenticates Google identities and persists Hub users, accounts, sessions, OAuth records and signing keys through the native MongoDB adapter. Consumer sessions remain independent; the documented AGW-05 decision introduces this persistence and invalidates old stateless Hub cookies.
- Every verified Google identity may use the catalog and request per-application access. These identity-scoped routes use `getVerifiedSession()` and do not imply a grant to another application.
- `ALLOWED_EMAILS` is the sole source of Hub administrator membership. Resolve it on the server for every admin action and page. Never accept a client-supplied actor email or role.
- Application grants and requests are scoped by `appId` and normalized email in MongoDB. Validate every action input with shared Zod schemas and check the verified identity and administrator role inside each action; layouts and the proxy are not an authorization boundary.
- A pending request must be reviewed using its exact request UUID and app ID. Rejecting or revoking access must not let a stale request decision grant access later. Resubmission creates a fresh request UUID.
- Catalog grants authorize registered Pocha Score and Card Wars clients through live OIDC UserInfo. Never share cookies/session secrets or change unrelated applications.
- Better Auth's catch-all route owns protocol input validation. Keep application-owned forms and action inputs under shared Zod contracts.
- Read configuration through `src/config/env.ts`. Never log cookies, tokens, OAuth credentials, or actual allowed email addresses.
- Unit tests do not establish that a real Google OAuth flow works. Record manual or integration evidence separately when that flow changes.
- Keep post-login redirects internal through `getSafeCallbackUrl()` and cover accepted redirect behavior with regression tests.

## Authorized consumer access integration (AGW-05)

The human request now authorizes integration of Pocha Score and Card Wars. Expose central OIDC with separate registered consumers, exact callbacks, S256 PKCE and signed ID-token validation; derive live grants from the validated token client. MongoDB grants remain unchanged; Hub identity now persists with the native MongoDB adapter and old stateless cookies require reauthentication. This supersedes the earlier prohibition on consumer changes for this delivery; Google credentials exist only in Hub. Never accept a browser's email as an authenticated identity.
