# Future application sign-in integration

This document records a future integration boundary. The current Damaca Hub iteration does not expose an identity provider, OIDC endpoints, app clients, or authorization APIs. Existing applications continue to authenticate and authorize users independently.

## Identity flow

- Use OpenID Connect as the standard protocol. A consumer application redirects the user to the production Hub, which authenticates the user through Google and returns a signed identity response to a registered callback.
- Each consumer validates the protocol response and creates its own application session. Never share cookies, Better Auth session values, signing secrets, or MongoDB session records between applications.
- Register a separate client and exact callback URLs for each application and environment. Tie each client to one catalog application; production and preproduction for that application use the same app-scoped grant.
- The production Hub is the authorization authority for both environments of connected applications. The `int` Hub has separate configuration and database data for integration testing and never grants access to production resources.

## Authorization checks

- Consumers request authorization from the Hub server-to-server after establishing identity. Derive the subject from the validated identity response, then check the grant for the registered application.
- Deny access when the Hub cannot be reached, the response cannot be validated, the client is unknown, the application is inactive, or no current grant exists.
- Check authorization on each protected server access so a revocation takes effect on the next access. Do not cache an authorization grant in a long-lived consumer cookie.
- Keep administrator identity separate from a normal app grant. The Hub's `ALLOWED_EMAILS` remains the only source of administrator membership.
- Evaluate local and offline applications separately before integrating them; their offline behavior must not imply a fresh authorization decision.

## Security and rollout

- Use signed, audience-bound, short-lived protocol responses, exact issuer and callback matching, state and nonce validation, and key rotation. Store client secrets only in each app's environment.
- Add contract and integration tests for login, callback rejection, app isolation, denied access, revoked access, unavailable Hub behavior, and key rotation before enabling a consumer.
- Migrate existing app permissions deliberately in a separate iteration. Do not automatically copy current grants into Hub or change a consumer's login flow as part of this catalog delivery.
