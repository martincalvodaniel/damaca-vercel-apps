# OIDC client administration

Google authentication and the OIDC provider are centralized in Hub. Pocha Score and Card Wars are public static PWAs and have no social login, grants, or OIDC clients. Administrators manage clients for other existing catalog apps in Hub, one per production/int environment.

Client secrets are shown once and stored as hashes. Callbacks are exact and changes take effect on subsequent requests without restarting Hub. Disabling a client also revokes its delegated access and refresh tokens. See [the shared package guide](../../../packages/identity/README.md) for origin resolution, consumer credentials and protocol checks.
