# Monorepo Instructions

- Keep all generated or edited code and code comments in English. Communicate with the user in Spanish.
- Each application remains independent under `apps/<name>`. Preserve its product behavior and scoped instructions.
- Use Bun workspaces and the root Bun lockfile. Declare common direct dependency versions in the root catalog and reference them with `catalog:`.
- Use the root Biome configuration. `bun run lint` checks only changed and new files; when an existing file is edited, correct all Biome findings in that file.
- Run app tasks through root scripts or Turbo filters, for example `bun run build --filter=@damaca/billing-poc`.
- Preserve per-app environment variable boundaries and never copy secrets or local Vercel credentials into the repository.
- Keep Vercel projects scoped to their app directory and keep `main` human-managed.
