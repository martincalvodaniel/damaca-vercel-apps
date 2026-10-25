# Identity authorization simulation

The mock is generated from `packages/identity/docs/userinfo.openapi.yaml` and narrowed to the UserInfo calls this consumer makes. It models responses, not Google authentication or OAuth token issuance. No external owner mock or workspace was available/needed for this repository-owned API. No Postman workspace was created or published.

Run from the root with `postman simulation run postman/simulations/identity.sim.yaml --port 4909 --output ndjson --no-history`. Path routing strips `/api`, so the handler receives `/auth/oauth2/userinfo`. Point `checkHubAccess` at `http://127.0.0.1:4909`. Test-only bearer values select responses: `approved` → approved, `revoked` → denied, `expired` → denied (401), `unavailable` → unavailable (500 HTML). No real token or secret is used.

On 2026-10-25, the real package HTTP client produced all four expected outcomes and the run log recorded four GET requests to the Hub member (200, 200, 401, 500). Only the Hub member exists; no member was silent. Logs remained in temporary files and were not committed.

The CLI needed permission to bind loopback ports. Mock generation wrote valid local files but then returned a macOS keychain `SecItemCopyMatching` error; simulation creation and execution succeeded. This run proves client transport, parsing and fail-closed response handling against contract stand-ins. Package integration tests separately exercise actual OIDC handlers with an in-memory adapter; live Google, MongoDB persistence, deployed routing and native installation still need the configured environments.
