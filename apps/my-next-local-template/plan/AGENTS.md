# Planning Rules

- Write product explanations in Spanish; keep paths, code identifiers, technical literals, and commit messages in English.
- `master.md` owns product scope and accepted decisions; `iterations.md` owns dependency order and status; `workflow.md` owns delivery rules; `iteration-log.md` owns historical evidence.
- Read all four before planning a delivery. Keep the current summary concise; append evidence to the log instead of accumulating contradictory policies in the workflow.
- For each non-trivial iteration, define goal, `target_paths`, dependencies, acceptance criteria, and validation before implementation.
- Distinguish proposed decisions, accepted requirements, implemented behavior, validated behavior, and deployment prerequisites.
- Never mark a delivery validated if a required acceptance check is blocked. Record the exact check, reason, and next action.
- Update affected documents together when a decision changes. Preserve historical evidence; add corrections explicitly.
- Link only to existing local files or verified primary sources. Never copy credentials, personal data, historical account quotas, or permissions from another project.
- Keep future work pending until the user defines and authorizes the product. Do not turn sample entries into fabricated progress.
- Follow the root [agent workflow](../../../plan/workflow.md) for branch, capacity, commit, push, and remote verification. The user alone manages `main`.

- Current local-only invariants are authoritative: static export, IndexedDB, installation and offline without accounts, backend or external runtime services. Historical iterations 00–06 are evidence, not active requirements; preserve them and record their supersession explicitly.
- For storage/PWA changes, plan non-destructive migrations, failures, offline reloads, update behavior and data recovery as applicable. Native installation must be reported separately from browser emulation.
