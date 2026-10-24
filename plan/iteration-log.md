# Registro de entregas transversales

Los hechos de publicación se verifican en Git. El estado normativo está en [iterations.md](iterations.md); este registro conserva evidencia, límites e incidentes observados.

<a id="agw-01-centralizar-el-flujo-y-el-contrato-documental"></a>
## AGW-01 — Centralizar el flujo y el contrato documental

- Cambios: contrato de planificación añadido a las instrucciones raíz; responsabilidades y retención documental incorporadas al workflow; cinco workflows locales retirados; instrucciones de planificación redundantes consolidadas; documentos extensos archivados bajo `plan/archive/2026-10-24/` en cada ámbito afectado; las apps conservan sus límites de producto en sus instrucciones.
- Evidencia: el commit `5800b12d0f9b8183fba89cec97e30c5fc05fa254` está en `int` y `origin/int` (comprobación al iniciar esta entrega).
- Validación: los enlaces Markdown locales y anclas resuelven; las cinco apps contienen los tres documentos y no conservan workflow local; `bun run lint` pasa para los 1929 archivos (726 warnings y 2112 infos existentes; los archivos de aplicación con esos diagnósticos no se modificaron); los documentos Markdown editados pasan Biome y `git diff --check` queda limpio. Revisión manual confirma que solo `iterations.md` contiene estados y que el log mantiene las diez evidencias recientes de Dalis Tasks & Events; los archivos anteriores están indexados en sus archivos fechados.
- Límites: solo documentación; no se modifican CI, generadores ni aplicaciones.

<a id="agw-02-generación-de-apps-con-turborepo"></a>
## AGW-02 — Generación de apps con Turborepo

- Cambios: `bun run generate:app` ejecuta `turbo gen app`, con preguntas o respuestas por `--args`; la base `mongo-google` conserva Better Auth, Google, MongoDB y gestión de acceso; `local-pwa` conserva IndexedDB, exportación e instalación offline. Ambos modos generan identidad, puerto, instrucciones específicas y planificación de producto. Se excluyen `.env.local`, `.vercel`, dependencias y artefactos de build.
- Evidencia: `bun run test:generator` pasa 6 casos y 37 aserciones; ambas apps temporales generadas pasan type-check, y sus pruebas pasan (local: 14; MongoDB: 37). Las apps temporales se retiraron después de comprobar los resultados.
- Validación: generación interactiva con puerto predeterminado 3007 y por argumentos para ambos modos; los tests rechazan colisiones, entradas inválidas y destino ocupado, preservan archivos existentes y comprueban enlaces/documentos. El build local pasa mediante el filtro raíz y su exportación contiene 47 recursos de shell offline. El build MongoDB pasa con `next build --webpack`. En navegador, Settings y Home siguen cargando desde la caché y permiten navegar con el preview detenido. `bun install --frozen-lockfile`, `git diff --check` y Biome pasan sin errores.
- Límites: el build MongoDB mediante Turbo/Turbopack no pudo ejecutarse porque el sandbox denegó un proceso auxiliar (`Operation not permitted`); el mismo código compiló con Webpack. No se probaron credenciales OAuth reales ni conexión a una base MongoDB externa. Biome conserva 14 warnings presentes en las bases copiadas; no hubo errores.

<a id="agw-03-retirar-workspaces-de-plantilla"></a>
## AGW-03 — Retirar workspaces de plantilla

- Cambios: retirados los workspaces `my-next-template` y `my-next-local-template`; sus bases y pruebas permanecen bajo `turbo/generators/templates/`. Inventario actualizado a tres apps activas y lockfile sin dependencias workspace huérfanas. Se conserva el historial en `plan/archive/2026-10-24/`; los proyectos Vercel existentes no se modificaron.
- Evidencia: `bun install` eliminó las entradas de los dos workspaces; `bun install --frozen-lockfile` pasó sin cambios; `bun run test:generator` pasó (6 tests, 37 expectativas); `bun run type-check` pasó en 3/3 apps; `bun run test` pasó en 3/3 (Tasks Events: 1,386 pass, 225 skip, 0 fail); `git diff --check` pasó.
- Límites: `bun run lint` global informa diagnósticos previos en archivos no modificados (incluidos errores de formato/test style en Billing). Biome aplicado a los documentos modificados. Los builds de apps Next.js fallaron porque Turbopack intenta crear un proceso auxiliar/enlazar un puerto local (`Operation not permitted`); el build PWA generada y la prueba offline están documentadas en AGW-02.
- Publicación: pendiente.
