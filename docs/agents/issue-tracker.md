# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `martincalvodaniel/damaca-vercel-apps`. Use the `gh` CLI with `--repo martincalvodaniel/damaca-vercel-apps`; the Git remote uses a personal SSH host alias.

## Operations

- Create: `gh issue create --repo martincalvodaniel/damaca-vercel-apps --title "..." --body-file <file>`.
- Read: `gh issue view <number> --repo martincalvodaniel/damaca-vercel-apps --json number,title,body,labels,comments`.
- List: `gh issue list --repo martincalvodaniel/damaca-vercel-apps --state open --json number,title,body,labels`, with relevant label filters. Read comments separately for selected issues.
- Comment: `gh issue comment <number> --repo martincalvodaniel/damaca-vercel-apps --body-file <file>`.
- Apply or remove labels: `gh issue edit <number> --repo martincalvodaniel/damaca-vercel-apps --add-label "..."` or `--remove-label "..."`.
- Close: `gh issue close <number> --repo martincalvodaniel/damaca-vercel-apps`.

Write multiline bodies to a file and pass `--body-file`. When a skill says to publish to the issue tracker, create a GitHub issue. When it says to fetch a ticket, read the issue and its comments.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub issues and PRs share a number space. Resolve an ambiguous reference with `gh pr view` and fall back to `gh issue view`, using the explicit repository.

## Wayfinding operations

Use a `wayfinder:map` issue as the map and native sub-issues as its children. Where sub-issues are unavailable, use a task list in the map and `Part of #<map>` in each child. Child types use `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling` or `wayfinder:task`.

Represent blockers with native issue dependencies when available, using numeric issue database IDs. Otherwise write `Blocked by: #<number>` in the child. The frontier is the first open, unassigned child in map order with no open blocker. Claim through assignment to `@me`; resolve through a result comment, issue closure and a linked decision in the map.

## Delivery policy

Tickets describe requested work. Accepted scope, iteration status and observed evidence remain in the three planning documents required by `plan/workflow.md`, rooted at the affected app or at the repository for shared work. Link tickets to the relevant plan. A triage label does not authorize unattended work or delegation; follow the root workflow and the user's authorization.

## Skill compatibility

Use engineering skills as task-specific methods under the [root workflow](../../plan/workflow.md). Keep ticket specifications in GitHub; planning documents link to them and record their own scope, delivery status or evidence without copying ticket bodies.

`implement` follows the root workflow for validation and publication. Apply the same explicit delegation requirement to reviews and research performed through skills. When delegation is not authorized, perform the applicable checks sequentially in the current agent.

`implement-spec` prescribes concurrent agents, integration branches and per-ticket worktrees; `wayfinder` also prescribes research branches and subagents. These execution patterns require an explicit user-approved change to the applicable workflow before use. For ordinary delivery, implement approved slices sequentially on `int`. Use wayfinding decision maps only within the authorized planning scope.

Treat `ready-for-agent` as implementation readiness, with execution subject to user authorization and the root workflow.
