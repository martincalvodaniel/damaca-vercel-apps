# Engineering documentation

This guide describes the repository configuration inspected on October 24, 2026.
The linked source files are authoritative when configuration changes.

| Guide                                                   | Read it to understand                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [Monorepo architecture and daily workflow](monorepo.md) | Workspaces, catalogs, application boundaries, commands, and CI               |
| [Turbopack in this repository](turbopack.md)            | How Next.js bundles each app and how the custom PWA builds work              |
| [Deployment and caching](deployment-and-caching.md)     | Vercel installation, task caching, environment handling, and troubleshooting |

The tools have separate responsibilities: **Bun** installs dependencies and runs
scripts, **Turborepo** schedules and caches tasks, and **Turbopack** bundles the
Next.js applications. Vercel deploys each application as an independent project.
