<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Scope and Language

- This is a reusable, local-only, installable webapp starter. Its current scope supersedes the authentication/database implementation documented in historical iterations 00–06. Do not infer a product domain or roadmap from Git ancestry or neighboring repositories.
- All code, identifiers, code comments, technical errors and commit messages must be in English. Communicate in the user's language; README and product plans may be Spanish.
- Keep visible UI, validation, accessibility text and `lang="en"` in English unless explicitly requested otherwise.
- Read nested `AGENTS.md` before editing scoped directories. They add constraints without weakening these boundaries.

## Product Invariants

- No login, social identity, accounts, roles, remote database, backend, telemetry, CDN, remote fonts or runtime API dependency. Data stays in IndexedDB on the user's browser/device.
- Keep `output: "export"`. Server Components compose static content at build time; browser state and mutations run in Client Components through local repositories. Do not introduce Server Actions, request-dependent routes, proxy, cookies or runtime secrets.
- Installation and offline access are baseline capabilities. Preserve the manifest, local icons, safe areas and service worker. Only register it in production builds; verify offline against the static preview, never infer it from `next dev`.
- Product data belongs in IndexedDB. localStorage is allowed only for the small synchronous theme bootstrap cache, never as an alternative data layer. Cache Storage holds disposable application assets, never user records.
- Browser storage is origin/profile/device scoped and may be cleared or evicted. Do not imply backup, encryption, authentication or cross-device sync. Before introducing irreplaceable product data, define export/import and recovery acceptance with the user.
- Adding a backend, authentication, external requests, sync, notifications, core dependencies or a new storage solution needs explicit human authorization. Routine implementation within these invariants is autonomous. The user has authorized `idb` and development-only `fake-indexeddb` for this conversion.

## Iteration Workflow

1. Read `plan/master.md`, `plan/workflow.md`, the relevant iteration in `plan/iterations.md`, and recent `plan/iteration-log.md` entries.
2. Inspect Git and preserve unrelated changes. Work exclusively on `int`: select the existing local branch, track `origin/int` if present, otherwise fetch and create `int` from `origin/main`. Never reset, stash or carry unrelated changes across branches implicitly. Report conflicts before editing. Never implement on `main`.
3. Before a non-trivial edit, record goal, `target_paths`, dependencies, acceptance and validation in the plan. Include storage migrations, offline behavior and installation impact when relevant.
4. Deliver the smallest coherent authorized change. Resolve routine choices autonomously; document architecture changes and rationale.
5. Update status and log with actual results, limits and next step. Blocked checks are not passing checks.
6. Review exact staged files and close every validated iteration with a Conventional Commit, push to `origin/int` and remote SHA verification, including docs-only changes. Follow `plan/workflow.md`.

Work sequentially by default. Spawn subagents only with explicit authorization. Assign disjoint paths and one integration owner; workers must preserve others' edits. Shared schemas, lockfiles, package scripts, database migrations and planning have one owner. Agent completion does not replace integrated validation.

## Codex Usage Capacity

- Follow the [5h/7d capacity policy](plan/workflow.md#capacidad-de-codex-ventanas-de-5h-y-7d) throughout agentic iterations. Query Codex usage limits at session start, before each iteration, at significant checkpoints and at closure; track both windows and their reset times.
- Preserve at least 7% of the total 5h allowance and 2% of the total 7d allowance after the entire delivery. Estimate analysis, implementation, required validation, repairs and closure against both remaining allowances before starting.
- If the full iteration will not fit, complete a smaller validated delivery that will fit and leave the rest pending. Maximize useful authorized progress within those reserves; never trade required checks for more scope, assume unknown usage is unlimited or start work that cannot be closed.

## Authoritative Stack

- Next.js 16 App Router, React 19, React DOM 19, TypeScript, Tailwind CSS 4.
- `idb` for IndexedDB promises/transactions; Zod for shared validation. Native browser APIs for PWA capabilities.
- Bun for dependencies/tests; Biome for formatting/lint; `fake-indexeddb` only in tests; Knip for unused-code inspection.
- Exact versions belong to `package.json` and `bun.lock`; install with `bun install --frozen-lockfile`. Bun is the single lockfile source.
- Do not add speculative libraries, an ORM, state library, UI kit, PWA framework or alternative auth/data stack. Add dependencies only for concrete authorized needs.

## Architecture and Boundaries

```text
src/app/                         Routing and static metadata only
src/components/{ui,shared}/      Reusable primitives and shell/providers
src/features/<feature>/          Domain components, hooks and local services
src/lib/storage/                 IndexedDB connection, migrations, repositories
src/lib/pwa/                     Installation/offline contracts and hooks
src/lib/theme/                   Theme client behavior
src/config/                      App identity, storage namespaces and constants
src/schemas/                     Runtime-agnostic Zod schemas
src/types/                       Runtime-agnostic types, when needed
scripts/                        Static preview and service-worker generation
```

- `app/**` is thin composition. Put behavior in features/lib. Prefer static composition and narrowly scoped Client Components.
- Access browser APIs only in effects, event handlers or called client functions, never at module load or prerender. `"use client"` does not disable prerendering.
- Only `lib/storage/**` imports `idb` or opens IndexedDB; features use repository functions. Follow its nested rules for validation, transactions, migrations and lifecycle.
- Shared schemas/types must not import framework or browser storage APIs. Validate both application inputs and persisted records; handle corrupt data without silently deleting it.
- Use `@/*` for `src/*`, kebab-case files/folders, PascalCase components and camelCase functions/variables.
- Keep configuration in `config/**`. No environment variables are required; any future authorized environment access belongs there. Never log or commit secrets or personal data.

## Components and PWA

- Search for reusable components before adding one. One component per file; never nest component declarations or add components in unrelated modules.
- Domain UI belongs in `features/<feature>/components/**`; generic UI belongs in `components/ui/**` or `components/shared/**`.
- Mobile-first responsive UI, accessible labels, keyboard support, focus, touch targets and safe areas; navigation must not cover content. Keep Home/Settings until the actual product defines other destinations.
- Handle pending, empty, corrupt, blocked, quota and unavailable-storage states. Report a write successful only after commit; never hide failures with in-memory fallback.
- Generate the offline shell from every static build, including new routes, RSC payloads and chunks. App updates must not clear IndexedDB. Do not automatically force a waiting worker to activate; provide an explicit reload control.
- Keep service-worker cache deletion scoped to this app's prefix. Preserve the previous shell for already-open tabs. The hosting root and HTTPS policy must be documented; do not assume subpath hosting works.

## Definition of Done

For code/config/package changes:
- Scope, directives and prerender boundaries correct; no backend/runtime service dependence or external asset requests.
- Shared components reused, inputs/records validated, storage/index/migration impact evaluated.
- `bun run lint`, `bun run type-check`, relevant `bun run test`, `bun run build` and `git diff --check` pass.
- Exercise changed UI at mobile and desktop sizes. For storage/PWA changes, test real browser persistence, cold offline reloads, navigation and update behavior as relevant. Distinguish unit simulations, interaction, visual QA and native installation; do not claim unperformed device checks.
- Record commands, results and skipped/blocked checks. Use isolated origins/databases and remove only resources owned by the test.
- No secrets, generated output or unrelated user changes in the commit.

For docs-only changes: check local links, consistency and diff; do not rerun app checks without a relevant reason or add tests mirroring text.

## Permissions and Delivery

- The user authorizes working on `int` and a Conventional Commit/push after every completed, validated iteration, including docs. Do not request this permission again.
- Commit implementation and planning together; inspect exact staged files, preserve unrelated changes and never commit known-broken work to satisfy protocol.
- First publication: `git push -u origin int`; later: `git push origin int`. Verify remote `refs/heads/int` equals the local commit SHA before reporting publication. Never force-push.
- `main` is exclusively human-managed. Agents must not commit, merge, push, reset or rebase it. The user reviews and promotes `int`.
- On commit/push/verification failure, preserve validated changes, report the exact pending step and do not accumulate another unpublished iteration silently.
- Authorization covers only this project's configured remote. When copying the template, configure the destination remote before publishing. Do not change remotes, provision hosting, deploy production or schedule automation implicitly.
## Monorepo Commands

Run Bun installation and all project commands from the monorepo root. This workspace is `@damaca/my-next-local-template`. Use `bun run build --filter=@damaca/my-next-local-template`, `bun run test --filter=@damaca/my-next-local-template`, or `bun run type-check --filter=@damaca/my-next-local-template` to target this application. Dependencies and versions are managed in the root package manifest, Bun catalog, and `bun.lock`; do not create app-local lockfiles. Biome settings are managed at the root. Commit and publish monorepo changes from the monorepo root on `int`.
