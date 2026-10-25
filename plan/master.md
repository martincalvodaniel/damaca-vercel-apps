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

## Shared identity and Hub authorization

- `packages/identity` owns the central Google/OIDC provider, consumer sessions, Hub authorization client and access UI. Pocha Score and Card Wars require Google login and an explicit grant for their own application.
- Consumers become server-rendered Next.js applications. Local IndexedDB records remain unchanged and device-scoped; authentication does not encrypt them, isolate existing records by account, back them up or synchronize them.
- Google is configured only in Hub; each consumer/environment has its own OIDC callback, session secret and Hub client credential. The production Hub authorizes production and preproduction; test Hub configuration remains isolated. Hub issues signed identity tokens and derives application authorization from each validated access token and its registered client. No consumer-supplied email assertion is accepted.
- Offline product access is withdrawn by explicit user decision in AGW-05. Previously installed static copies cannot be revoked until they reconnect and update. No changes to infrastructure or production promotion are included.
