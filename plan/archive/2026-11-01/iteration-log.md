# Evidencia histórica AGW-03 y AGW-04

<a id="agw-03-retirar-workspaces-de-plantilla"></a>
## AGW-03 — Retirar workspaces de plantilla

- Cambios: retirados los workspaces `my-next-template` y `my-next-local-template`; sus bases y pruebas permanecen bajo `turbo/generators/templates/`. Inventario actualizado a tres apps activas y lockfile sin dependencias workspace huérfanas. Se conserva el historial en `plan/archive/2026-10-24/`; los proyectos Vercel existentes no se modificaron.
- Evidencia: `bun install` eliminó las entradas de los dos workspaces; `bun install --frozen-lockfile` pasó sin cambios; `bun run test:generator` pasó (6 tests, 37 expectativas); `bun run type-check` pasó en 3/3 apps; `bun run test` pasó en 3/3 (Tasks Events: 1,386 pass, 225 skip, 0 fail); `git diff --check` pasó.
- Límites: `bun run lint` global informa diagnósticos previos en archivos no modificados (incluidos errores de formato/test style en Billing). Biome aplicado a los documentos modificados. Los builds de apps Next.js fallaron porque Turbopack intenta crear un proceso auxiliar/enlazar un puerto local (`Operation not permitted`); el build PWA generada y la prueba offline están documentadas en AGW-02.
- Publicación: pendiente.

<a id="agw-04-incorporar-card-wars-al-inventario"></a>
## AGW-04 — Incorporar Card Wars al inventario

- README y documentación arquitectónica actualizados para cinco apps y sus puertos, incluido `@damaca/card-wars` en 3004.
- El plan raíz enlaza el master de producto Card Wars; las decisiones y evidencia de su implementación están en [su registro de app](../../../apps/card-wars/plan/iteration-log.md#01--mvp-de-partidas-y-marcador).
- Enlaces locales de README y de los tres documentos de planificación de la app resuelven; `git diff --check` pasa.
