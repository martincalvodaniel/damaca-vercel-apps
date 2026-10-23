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
- Preserve the mandatory iteration closing protocol: work on `int`, commit plan and implementation together after validation, push to `origin/int`, and verify the remote SHA. Documentation-only iterations follow the same protocol. The user alone merges and pushes `main`.
- Follow the Codex capacity section in `workflow.md`: current readings for both 5h/7d windows, conservative whole-delivery estimates, and closing reserves of 7%/2%. Split work before starting when it will not fit; preserve useful acceptance criteria and record the remainder. Query usage after publication, including documentation-only deliveries; do not create another commit solely for a post-commit reading.
