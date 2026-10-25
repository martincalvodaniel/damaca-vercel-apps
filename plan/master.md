# Plan agéntico del monorepo

## Objetivo vigente

Aplicar un único protocolo de trabajo para todas las aplicaciones presentes y futuras bajo `apps/*`, con cambios transversales planificados en la raíz. Cada app conserva sus requisitos y límites de producto.

## Decisiones vigentes

- [workflow.md](workflow.md) es el único protocolo normativo. Los tres documentos de planificación tienen responsabilidades separadas descritas allí.
- La política común conserva trabajo en `int`, cierre de iteraciones validadas con commit/push a `origin/int`, verificación del SHA remoto y reservas mínimas de capacidad de 7% en 5h y 2% en 7d. `main` sigue bajo gestión humana.
- Trabajo secuencial por defecto; delegación solo con autorización explícita.
- Las skills de ingeniería complementan el workflow raíz. [GitHub Issues](../docs/agents/issue-tracker.md) conserva solicitudes y especificaciones; los planes enlazan los tickets sin duplicarlos. Las [etiquetas de triaje](../docs/agents/triage-labels.md) expresan preparación, no autorización de ejecución. La [documentación de dominio](../docs/agents/domain.md) usa contextos por aplicación o paquete y se crea cuando se resuelven términos o decisiones. Los modelos de ramas o concurrencia de otras skills requieren acordar explícitamente su compatibilidad con el workflow antes de usarlos.
- Toda app bajo `apps/*` adopta `plan/master.md`, `plan/iterations.md` y `plan/iteration-log.md` antes de su primera implementación no trivial.
- [Turborepo Generate](https://turborepo.dev/docs/reference/generate) crea apps desde dos bases: Google OAuth y MongoDB, o PWA local con IndexedDB. La configuración del generador vive fuera de `apps/*` y crea los tres documentos de planificación antes de cualquier trabajo de producto.

## Aplicaciones

El monorepo contiene `billing-poc`, `dalis-home-management`, `dalis-tasks-events`, `pocha-score`, `card-wars` y [Damaca Hub](../apps/damaca-hub/plan/master.md). Las bases `mongo-google` y `local-pwa` viven en `turbo/generators/templates/`, fuera de `apps/*`, y crean nuevos workspaces bajo demanda. La lista de apps activas puede cambiar; la obligación documental aplica a todas las apps futuras. El alcance y registro de producto se mantienen en cada plan de app.

## Exclusiones y dudas

No se define aquí un roadmap de producto para ninguna app ni se autoriza promoción a `main`, despliegue o cambios de infraestructura.

## Calidad actual

AGW-09 restablece el lint global sin errores de formato. Los avisos y diagnósticos informativos existentes quedan fuera de este corte; evidencia en el [registro](iteration-log.md#agw-09-restore-global-lint-success).

Las seis aplicaciones disponen de favicons propios, recursos de instalación y Apple Touch Icon. Las PWA existentes incluyen iconos maskable; el generador compartido `bun run icons:generate` usa SVG locales y Sharp del catálogo. Entrega transversal [AGW-10](iterations.md#agw-10--application-favicons).

El generador de iconos se ejecuta desde el entorno de desarrollo raíz; las apps compilan de forma independiente con sus instalaciones filtradas de Vercel. CI comprueba los tipos con una instalación aislada por app.

El catálogo y las fichas de administración del Hub muestran los iconos de las aplicaciones desde copias SVG locales sincronizadas por ese mismo generador, sin depender de sus URLs de despliegue.

## Previous identity decision (historical, superseded by AGW-08)

- AGW-05 added a reusable Google/OIDC provider and consumer modules. It required game login and withdrew offline access.
- AGW-08 superseded those game requirements. Pocha Score and Card Wars are public, static and offline; Hub manages OIDC clients for other existing private apps.
- Production and `int` callbacks are explicit per client. Stable Vercel branch aliases are supported; commit-specific preview URLs are out of scope.

> AGW-08 superseded the social-login requirement for Pocha Score and Card Wars. AGW-11 now applies Hub-managed identity and per-app access to Dalis Tasks & Events while preserving its local Mongo identity and offline shell.
