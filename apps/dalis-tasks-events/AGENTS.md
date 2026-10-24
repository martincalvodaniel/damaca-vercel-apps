<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Language

- All generated or edited source code, identifiers, code comments, technical error messages, and commit messages must be in English.
- All user-facing graphical UI copy, including labels, validation messages, accessibility text, and empty states, must be in Spanish. Product names may remain unchanged.
- Planning and product documentation under `plan/**` may be in Spanish.

## Product Iteration Notes

Follow the [root agent workflow](../../plan/workflow.md) for branch selection, Codex capacity, iteration closure, commit, push, and delegation. This app retains its product-specific acceptance and resource-isolation requirements below and in `plan/`.

## Responsive Navigation

- Prioritize a minimal, information-dense mobile UI: compact rows and typography, short headings, avoid repeated subtitles and large status blocks, and reveal secondary actions/details on demand. Keep essential actions accessible and usable by touch; density must not depend on shrinking interactive targets below a usable size.
- Build mobile-first responsive screens, usable on both phones and desktop.
- Use a bottom navigation bar with local SVG icons on mobile and a top navigation bar on desktop, driven by a single shared destination registry.
- Whenever an important screen is added, update both navigation variants in the same iteration. Show only working destinations, active state and Spanish accessible labels.
- Keep the primary create button accessible, account for device safe areas, and ensure fixed navigation never covers content, focus targets or form controls.

## Tech Stack (Authoritative)

- `next@16`, `react@19`, `react-dom@19` — App Router, Server Components, Server Actions
- `better-auth` — authentication (server config + browser client)
- `mongodb` (native driver, **no ODM / no Mongoose**) — data layer
- `server-only` — enforce the server/client boundary
- `swr` — client-side data fetching
- `zod` — schema validation (shared client/server)
- **TypeScript** is mandatory across the codebase.

Do not introduce new core dependencies (ORMs, state libraries, UI kits, alternative auth/data solutions) without explicit human approval.

## Target Architecture (Baseline)

This is the **baseline**, not a rigid contract. Deviate only when justified by real code, and document the rationale.

```text
src/
├── app/                          # ROUTING ONLY
│   ├── (auth)/                   # auth route group
│   ├── (dashboard)/              # protected route group (session check in layout)
│   └── api/
│       ├── auth/[...all]/route.ts
│       └── pdf/route.ts
├── components/
│   ├── ui/                       # generic primitives
│   └── shared/                   # layout-level components
├── features/                     # domain-driven modules
│   └── <feature>/
│       ├── components/
│       ├── hooks/                # client-side, SWR
│       └── actions.ts            # "use server"
├── lib/
│   ├── auth/
│   │   ├── auth.ts               # server ("server-only")
│   │   └── auth-client.ts        # browser
│   ├── db/
│   │   ├── client.ts             # MongoDB singleton ("server-only")
│   │   └── collections.ts
│   ├── pdf/
│   │   └── generate.ts           # pdf-lib ("server-only")
│   └── utils.ts
├── schemas/                      # zod, shared
├── types/
├── hooks/                        # global client hooks
└── config/                       # constants + typed env access
```

## Boundary Rules (Non-Negotiable)

- `lib/db/**`, `lib/pdf/**`, and server-side auth (`lib/auth/auth.ts`) MUST start with `import 'server-only'`.
- `schemas/**` and `types/**` MUST stay framework- and runtime-agnostic (importable from client and server).
- `swr` hooks and `auth-client.ts` are client-only and MUST carry `"use client"` where applicable.
- `app/**` is reserved for routing primitives (`page`, `layout`, `loading`, `error`, `route`); business logic lives in `features/**` or `lib/**`.
- MongoDB connection MUST use a **singleton pattern** to survive hot reloads and serverless invocations. Never open a new connection per request.

## Coding Conventions

- **Server-first**: prefer Server Components and Server Actions. Use `swr` only for interactive/client-driven data (polling, optimistic updates, revalidation).
- **Validation**: every Server Action and route handler that accepts input MUST validate it with a `zod` schema from `schemas/**`. Do not duplicate validation logic.
- **Mutations**: implement via Server Actions in `features/<feature>/actions.ts` marked `"use server"`.
- **Path alias**: use `@/*` mapped to `src/*`. Avoid deep relative imports (`../../../`).
- **PDF generation**: keep all `pdf-lib` logic in `lib/pdf/**` (server-only) and expose it via a route handler or Server Action — never bundle it client-side.
- **Naming**: `kebab-case` for files/folders, `PascalCase` for components, `camelCase` for functions/variables.
- **Env vars**: access only through `config/**`; never read `process.env` directly inside components or features.
- **MongoDB indexes**: when a feature adds a collection or a new query, sort, lookup, or uniqueness pattern, evaluate its index needs in the same change and register required indexes in `src/lib/db/ensure-indexes.ts`. Never create indexes ad hoc.

## Component Extraction Policy

- **No inline components.** Define components in their own files instead of declaring them inline within other components.
- **Scope by reuse:** if a component is tightly coupled to a specific context, colocate it within that feature/context (`features/<feature>/components/**`). If it is generic and reusable, place it in the shared components folder (`components/ui/**` or `components/shared/**`).
- **Reuse first:** before creating a new component, search for an existing one that fits the need and reuse it whenever possible.

## Security & Data

- Never log secrets, tokens, or PII.
- Never commit `.env*` files or credentials.
- Enforce auth checks in protected route group layouts, not only on the client.
- Treat all external input as untrusted until validated by `zod`.
## Definition of Done

- [ ] Code placed at the correct target path with the right boundary directive (`server-only` / `"use client"`).
- [ ] All imports updated; no broken references; uses `@/*` alias.
- [ ] Components extracted to their own files and correctly scoped (feature-local vs shared); existing components reused where applicable.
- [ ] Input validated with `zod` schemas from `schemas/**`.
- [ ] MongoDB access goes through the singleton.
- [ ] `tsc --noEmit` passes (no type errors).
- [ ] `next build` succeeds with **no client/server import leaks** (no `server-only` module reachable from a client component).
- [ ] No secrets or `.env*` introduced into version control.

## What NOT to Do

- Do not put business logic, DB access, or PDF logic inside `app/**`.
- Do not import `lib/db`, `lib/pdf`, or server auth from client components.
- Do not declare inline components or duplicate components that already exist.
- Do not add an ORM or replace the native MongoDB driver.
- Do not bypass `zod` validation on inputs.
- Do not introduce new top-level dependencies without approval.
- Do not reveal or hardcode secrets.

## When in Doubt

Prefer the **server-first**, **boundary-safe**, **validated** option. If a decision materially changes architecture, dependencies, or security posture, **pause and request human confirmation** rather than guessing.
## Monorepo Commands

Run Bun installation and all project commands from the monorepo root. This workspace is `@damaca/dalis-tasks-events`. Use `bun run build --filter=@damaca/dalis-tasks-events`, `bun run test --filter=@damaca/dalis-tasks-events`, or `bun run type-check --filter=@damaca/dalis-tasks-events` to target this application. Dependencies and versions are managed in the root package manifest, Bun catalog, and `bun.lock`; do not create app-local lockfiles. Biome settings are managed at the root. Commit and publish monorepo changes from the monorepo root on `int`.
