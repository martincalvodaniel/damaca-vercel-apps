<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Scope and Language

- This application is Damaca Hub, the authenticated directory and per-application access manager described in [plan/master.md](plan/master.md). Do not expand product scope beyond that plan.
- All generated or edited code, identifiers, code comments, technical error messages, and commit messages must be in English.
- Communicate with the user in their language. README and product planning may be in Spanish.
- Keep all visible copy, validation messages, accessibility text, and HTML `lang="en"` in English; no localization framework is installed.
- Read applicable nested `AGENTS.md` files before editing their directories. Nested rules add scoped constraints without weakening root boundaries.

## Agent Workflow

Follow the [root agent workflow](../../plan/workflow.md) for branch, planning, capacity, validation, commits, and publication. Read this app's `plan/master.md`, the relevant `plan/iterations.md` entry, and recent `plan/iteration-log.md` entries for product-specific acceptance. Nested app instructions add their local constraints.

## Authoritative Stack

- Next.js 16 App Router, React 19, React DOM 19, and TypeScript.
- Better Auth for Google authentication; the Hub OIDC provider persists identity and tokens with the native MongoDB adapter.
- Native `mongodb` driver, `server-only`, SWR, and Zod.
- Tailwind CSS 4, Biome, and Bun for package management and tests.
- Exact versions belong to `package.json` and `bun.lock`. Use `bun install --frozen-lockfile` for a reproducible installation. Keep Bun as the single lockfile source.
- Do not introduce core dependencies, an ORM, a state library, a UI kit, or alternative auth/data solutions without explicit human approval. PDF support is not installed; evaluate it only for a concrete requirement.

## Architecture and Boundaries

```text
src/app/                         Routing primitives only
src/components/{ui,shared}/      Reusable primitives and layout components
src/features/<feature>/          Domain components, hooks, services, actions.ts
src/lib/auth/                    Server auth, authorization, browser client
src/lib/db/                      Native MongoDB data layer and repositories
src/config/                      Constants and typed environment access
src/schemas/                     Shared Zod schemas, created when needed
src/types/                       Shared runtime-agnostic types, created when needed
src/hooks/                       Global client hooks, created when needed
```

- `app/**` contains routing primitives (`page`, `layout`, `loading`, `error`, `not-found`, `route`) and their thin composition. Put business logic in `features/**` or `lib/**`.
- Prefer Server Components and Server Actions. Use SWR only for interactive client-driven fetching, polling, optimistic updates, or revalidation.
- Every runtime module in `lib/db/**` and server-side auth must begin with `import "server-only"`. The browser auth client and SWR hooks must be client-only with `"use client"` where applicable.
- Shared `schemas/**` and `types/**` must be framework- and runtime-agnostic. Do not expose MongoDB types or server-only imports to them.
- Read environment variables only through `config/**`; never access `process.env` directly from features or components.
- Use `@/*` mapped to `src/*`; avoid deep relative imports. Use kebab-case filenames/folders, PascalCase components, and camelCase functions/variables.

## Components and UI

- Search for reusable components before adding one.
- Define each component in its own file; do not declare components inside other components or inline in unrelated modules.
- Keep domain components under `features/<feature>/components/**`; generic components belong in `components/ui/**` or `components/shared/**`.
- Build responsive, mobile-first screens with accessible labels, keyboard support, visible focus, usable touch targets, and no fixed content covering controls.
- Choose navigation based on the actual product; do not predefine destinations or product-specific navigation patterns in the starter.

## Validation, Authentication, and Data

- Validate every application-controlled input to a Server Action or route handler with a shared Zod schema from `schemas/**`, including query parameters and identifiers. Third-party protocol handlers such as Better Auth own their protocol validation; do not replace their parsing with a duplicate contract.
- Implement application mutations in `features/<feature>/actions.ts` with `"use server"`; delegate persistence to the data layer.
- Check sessions in protected layouts and authorize each data access and mutation at its server entry point. Layouts and proxy redirects alone do not protect Server Actions or API handlers.
- The proxy only checks cookie presence. Never treat that as validated identity or permissions.
- Any verified Google identity may view the catalog and submit access requests; these identity-scoped operations use `getVerifiedSession()` and do not require a product grant.
- `ALLOWED_EMAILS` defines administrators only. Per-application grants and requests are persisted in MongoDB; a grant for one app never grants access to another. Resolve roles and grants on the server for every operation; never trust roles or emails submitted by a client or cached in a session cookie. Keep administration checks inside each action. Do not silently change cookie/session persistence, lifetimes, or authentication strategy.
- Current app grants authorize registered Pocha Score and Card Wars consumers. Central SSO uses OpenID Connect, app-specific clients and callbacks, separately established consumer sessions, no shared cookies or session secrets, and production Hub authority for both environments. AGW-05 authorizes central OIDC and consumers for Pocha Score and Card Wars.
- Only `lib/db/**` imports the MongoDB driver. Use its singleton, collection registry, and repository functions; never create connections per request.
- Evaluate indexes whenever introducing a collection or query/sort/lookup/uniqueness pattern. Register required indexes in `src/lib/db/ensure-indexes.ts`, never ad hoc.
- Never log or commit secrets, tokens, credentials, or personal data. `.env.example` is the only tracked environment template and must contain placeholders only.
- Use isolated resources for integration tests and clean up only resources owned by the test. Do not run database commands against user or production data implicitly.

## Definition of Done

For code, configuration, or package changes:
- Correct paths and client/server directives; no server-only imports reachable from a client component.
- Existing components reused; new components extracted and scoped correctly.
- Inputs validated, operations authorized, persistence routed through the singleton, and index needs evaluated where applicable.
- `bun run lint`, `bun run type-check` (`tsc --noEmit`), relevant tests through `bun run test`, and `bun run build` pass.
- Exercise changed UI at mobile/desktop sizes when applicable; distinguish visual inspection from interaction and unit tests.
- Record commands and outcomes, including skipped/blocked checks. An unavailable environment does not count as a successful build or integration test.
- `git diff --check` passes; no secrets, generated output, or unrelated user changes included.

For documentation-only changes, check local links, consistency, and `git diff --check`; do not rerun application checks without a relevant reason. Add meaningful tests for behavior and risk, not tests that merely mirror reversible text changes.

## Delivery

Branch, commit, push, and remote verification follow the root workflow. Preserve this app's local environment and product boundaries.

## Monorepo Commands

Run Bun installation and all project commands from the monorepo root. This workspace is `@damaca/damaca-hub`. Use `bun run build --filter=@damaca/damaca-hub`, `bun run test --filter=@damaca/damaca-hub`, or `bun run type-check --filter=@damaca/damaca-hub` to target this application. Dependencies and versions are managed in the root package manifest, Bun catalog, and `bun.lock`; do not create app-local lockfiles. Biome settings are managed at the root. Commit and publish monorepo changes from the monorepo root on `int`.

## Authorized consumer access integration (AGW-05)

The human request now authorizes integration of Pocha Score and Card Wars. Expose central OIDC with separate registered consumers, exact callbacks, S256 PKCE and signed ID-token validation; derive live grants from the validated token client. MongoDB grants remain unchanged; Hub identity now persists with the native MongoDB adapter and old stateless cookies require reauthentication. This supersedes the earlier prohibition on consumer changes for this delivery; Google credentials exist only in Hub. Never accept a browser's email as an authenticated identity.
