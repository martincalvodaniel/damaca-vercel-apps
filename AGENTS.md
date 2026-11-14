# Monorepo Instructions

- Keep all generated or edited code and code comments in English. Communicate with the user in Spanish.
- Each application remains independent under `apps/<name>`. Preserve its product behavior and scoped instructions.
- Use Bun workspaces and the root Bun lockfile. Declare common direct dependency versions in the root catalog and reference them with `catalog:`.
- Use the root Biome configuration. Plain `bun run lint` checks the repository; use
  `--staged` or `--changed --since=<base>` for an explicit incremental check. When
  an existing file is edited, correct all Biome findings in that file.
- Run app tasks through root scripts or Turbo filters, for example `bun run build --filter=@damaca/billing-poc`.
- Preserve per-app environment variable boundaries and never copy secrets or local Vercel credentials into the repository.
- Keep Vercel projects scoped to their app directory and keep `main` human-managed.

## Web app installation

- Every web app must serve a public installation manifest and local icons at 192×192 and 512×512. Set `display: "standalone"`, a same-origin start URL and a scope that covers it. Preserve the existing installation ID and launch route when editing an app.
- Set `name`, `short_name`, `applicationName` and the Apple web app title from the same kebab-case installation name. Use the app identifier for new apps and append `-int` only when `VERCEL_GIT_COMMIT_REF` equals `int`. Both Turborepo starters implement this rule, and Turbo includes the branch in its cache key.
- When adding an app or changing installation metadata, verify the generated manifests for `main` and `int`, their links in the served HTML and their icons. Record Android installation separately when tested on a device.

## Responsive UI

- Design for narrow phones first. Fit as much useful information as possible in the initial viewport with compact margins, padding and gaps, simple layouts, and no repeated labels or copy. Keep text readable, controls easy to tap and content free of horizontal scrolling.
- Check changed screens on a narrow phone and on desktop. Desktop layouts may use more spacing when it improves readability or grouping.

## Agent workflow

- The root [agent workflow](plan/workflow.md) is authoritative for branch selection,
  iteration planning, Codex capacity, validation, commit, and push across the monorepo.
- Read the applicable app `AGENTS.md` and nested instructions; those add product and
  technical constraints but do not override the root delivery policy.
- Record cross-app or shared-tooling work in the root [plan](plan/master.md),
  [iterations](plan/iterations.md), and [delivery log](plan/iteration-log.md).
  App-specific work stays in that app's plan and log. Choose one primary log per
  delivery and cross-link it when a change affects another app.
- Work sequentially by default. Delegate only when the user explicitly authorizes
  delegation for the work; define disjoint paths and one integration owner.
- Every present and future application under `apps/*`, regardless of technology or creation mechanism, MUST adopt the three-document planning system (`plan/master.md`, `plan/iterations.md`, `plan/iteration-log.md`) before its first non-trivial implementation. The master owns current scope and decisions; iterations own status and acceptance; the log owns observed evidence. The root [workflow](plan/workflow.md) is the sole workflow policy. New-app acceptance includes checking these files, their links, and app-specific constraints. The root Turborepo app generator creates this structure for both starter modes.
- Use the root lint configuration. `bun run lint` checks the repository; narrow it
  explicitly with `--staged` or `--changed --since=<base>` as documented in the
  root workflow. Fix all findings in each edited file.

## Agent skills

### Issue tracker

Before reading or publishing tickets, read [the GitHub Issues conventions](docs/agents/issue-tracker.md).

### Triage labels

Before assigning triage roles, read [the label mapping](docs/agents/triage-labels.md).

### Domain docs

Before exploring domain terminology or decisions, read [the multi-context domain rules](docs/agents/domain.md).
