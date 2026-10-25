# damaca-vercel-apps

Monorepo for independent web applications. Applications stay in their own workspaces; Bun catalogs keep shared dependency versions aligned, and Turborepo coordinates builds and remote caching.

## Applications

| Workspace                       | Path                         | Development port |
| ------------------------------- | ---------------------------- | ---------------: |
| `@damaca/billing-poc`           | `apps/billing-poc`           |             3000 |
| `@damaca/dalis-home-management` | `apps/dalis-home-management` |             3001 |
| `@damaca/dalis-tasks-events`    | `apps/dalis-tasks-events`    |             3002 |
| `@damaca/pocha-score`           | `apps/pocha-score`           |             3003 |
| `@damaca/card-wars`             | `apps/card-wars`             |             3004 |
| `@damaca/damaca-hub`            | `apps/damaca-hub`            |             3005 |

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

## Create an app

Run `bun run generate:app` and select `mongo-google` for Google sign-in with MongoDB, or `local-pwa` for an installable app with browser-local IndexedDB. The generator asks for the app identifier, display name, and an available development port. It creates the new workspace under `apps/<identifier>` and includes the app-specific instructions and planning documents.

Run `bun run icons:generate` to regenerate application favicons (16/32/48-pixel ICO), installation PNGs (192/512), opaque maskable icons (512), and Apple Touch Icons (180) from local SVG sources. Pass an app identifier to update only that app, for example `bun run icons:generate pocha-score`. The source is `src/app/icon.svg`, except Dalis Tasks & Events, which keeps `public/dalis-icon.svg`. Existing PWA manifests use the installation assets; other apps expose Apple icons through Next.js file metadata without adding offline behavior.

The prompts can also be answered in one command:

```sh
bun run generate:app --args local-pwa personal-notes "Personal Notes" 3007
```

After generation, run `bun install` and use the printed Turbo-filtered commands. The MongoDB mode requires app-specific environment values and Google OAuth configuration before use. The local PWA mode has no credentials or remote runtime service.

Run `bun run lint` to check the repository, `bun run lint --staged` for staged files, or `bun run lint --changed --since=<base>` for files changed from a Git base. CI checks files changed from the relevant Git base. The root catalog in `package.json` is the source for shared dependency versions; commit the root `bun.lock` after changing dependencies.

## Agent planning

The [root workflow](plan/workflow.md) is the sole delivery protocol. Every current and future app under `apps/*`, regardless of stack or creation method, must include `plan/master.md`, `plan/iterations.md`, and `plan/iteration-log.md` before its first non-trivial implementation. The [root instructions](AGENTS.md) define each document's role and make the structure, links, and app-specific constraints part of app onboarding. `bun run generate:app` creates these files in either starter mode; CI tests the generator.

To share the Turbo cache locally, authenticate with `bun run turbo login` and link this repository with `bun run turbo link`.

## Vercel

Connect each existing Vercel project to this repository and set its Root Directory to the corresponding `apps/<name>` path. Enable access to files above the app directory and keep the root Bun installation and lockfile in scope. From an app Root Directory, use a Build Command such as `cd ../.. && bun run build --filter=@damaca/billing-poc`. Keep each project's existing domains, environment variables, and deployment environments. Apps generated in `local-pwa` mode export static files to `out/`.

Vercel Remote Cache is provided by Turborepo. Add `TURBO_TOKEN` and `TURBO_TEAM` to GitHub Actions secrets to share the cache with CI. Vercel builds use the same remote cache when connected to the team's Turbo cache.

## Environment variables

Copy an app's checked-in `.env.example` (or `.env.local.example`) to its local `.env.local` as needed. Configure production values in that app's Vercel project. Never commit real credentials.

## Shared identity

[The identity package](packages/identity/README.md) provides reusable Hub OIDC support. Pocha Score and Card Wars are public static PWAs with local IndexedDB records and offline access; they do not use social login. The Hub keeps Google login for its catalog and administrators manage OIDC clients for other existing applications there.
