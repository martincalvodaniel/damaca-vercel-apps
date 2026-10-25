# Domain docs

## Read before exploring

This repository uses a multi-context layout. Read the root `GLOSSARY-MAP.md`, when present, and each glossary relevant to the affected applications or shared packages. Read relevant ADRs from `docs/adr/` at the root and from `apps/<name>/docs/adr/` or `packages/<name>/docs/adr/`.

If these artifacts are absent, proceed silently. The domain-modeling skill creates them lazily as terms or decisions are resolved. Add a map entry when a context glossary is created.

## Layout

- `GLOSSARY-MAP.md`: index of context glossaries.
- `docs/adr/`: decisions spanning applications or shared tooling.
- `apps/<name>/GLOSSARY.md` and `apps/<name>/docs/adr/`: application terminology and decisions.
- `packages/<name>/GLOSSARY.md` and `packages/<name>/docs/adr/`: shared package terminology and decisions.

Use repository-relative links in the map. Choose the context that owns a concept; link shared terminology to its owning glossary rather than copying definitions between contexts.

## Vocabulary and decisions

Use glossary terms in issues, proposals, hypotheses and tests. If a needed concept is missing, reconsider whether it belongs to the domain and record genuine gaps for domain-modeling.

Surface conflicts with an existing ADR explicitly, identifying the ADR and why its decision should be reopened.

Follow the applicable app constraints and the [root workflow](../../plan/workflow.md). Keep accepted current scope in `plan/master.md`, iteration status in `plan/iterations.md` and observed evidence in `plan/iteration-log.md`. Reference ADRs from the master when a decision requires a separate rationale; each fact has one authoritative location.
