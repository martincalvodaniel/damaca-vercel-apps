# Application sign-in integration

Google authentication is centralized in Hub. Pocha Score and Card Wars use the shared OIDC consumer integration and must have a current app-specific grant. See [the shared package guide](../../../packages/identity/README.md) for the protocol, configuration, independent sessions, MongoDB persistence, token and signing-key rotation, offline limitations and rollout checks.

UserInfo derives the app from the validated token client and resolves active catalog state and grants on every request. No administrator bypass, caller-supplied email, shared cookies or shared session secrets. Production Hub authorizes production and int consumers with separate clients and exact callbacks; the int Hub and its database remain isolated for testing.

Other apps retain their current authorization. Integrating them requires a separate scoped delivery.
