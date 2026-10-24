# damaca-vercel-apps

Monorepo for five independent web applications deployed on Vercel. Applications stay in their own workspaces; Bun catalogs keep shared dependency versions aligned, and Turborepo coordinates builds and remote caching.

## Applications

| Workspace                        | Path                          | Development port |
| -------------------------------- | ----------------------------- | ---------------: |
| `@damaca/billing-poc`            | `apps/billing-poc`            |             3000 |
| `@damaca/dalis-home-management`  | `apps/dalis-home-management`  |             3001 |
| `@damaca/dalis-tasks-events`     | `apps/dalis-tasks-events`     |             3002 |
| `@damaca/my-next-local-template` | `apps/my-next-local-template` |             3003 |
| `@damaca/my-next-template`       | `apps/my-next-template`       |             3004 |

## Getting started

Use Bun 1.4.4 and Node.js 24. Run these commands from the repository root:

```sh
bun install
bun run dev
```

Run a task for every application with `bun run build`, `bun run test`, or `bun run type-check`. Target one application with a Turbo filter:

```sh
bun run build --filter=@damaca/billing-poc
```

Run `bun run lint` to check the repository, `bun run lint --staged` for staged files, or `bun run lint --changed --since=<base>` for files changed from a Git base. CI checks files changed from the relevant Git base. The root catalog in `package.json` is the source for shared dependency versions; commit the root `bun.lock` after changing dependencies.

## Agent planning

The [root workflow](plan/workflow.md) is the sole delivery protocol. Every current and future app under `apps/*`, regardless of stack or creation method, must include `plan/master.md`, `plan/iterations.md`, and `plan/iteration-log.md` before its first non-trivial implementation. The [root instructions](AGENTS.md) define each document's role and make the structure, links, and app-specific constraints part of app onboarding. Future Turborepo generation should scaffold the same files; no generator or CI gate is implied.

To share the Turbo cache locally, authenticate with `bun run turbo login` and link this repository with `bun run turbo link`.

## Vercel

Connect each existing Vercel project to this repository and set its Root Directory to the corresponding `apps/<name>` path. Enable access to files above the app directory and keep the root Bun installation and lockfile in scope. From an app Root Directory, use a Build Command such as `cd ../.. && bun run build --filter=@damaca/billing-poc`. Keep each project's existing domains, environment variables, and deployment environments. The static local template exports to `out/`.

Vercel Remote Cache is provided by Turborepo. Add `TURBO_TOKEN` and `TURBO_TEAM` to GitHub Actions secrets to share the cache with CI. Vercel builds use the same remote cache when connected to the team's Turbo cache.

## Environment variables

Copy an app's checked-in `.env.example` (or `.env.local.example`) to its local `.env.local` as needed. Configure production values in that app's Vercel project. Never commit real credentials.
