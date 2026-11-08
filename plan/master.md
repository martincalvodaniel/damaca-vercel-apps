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

## Diagnóstico de cuota Vercel

[AGW-14](iterations.md#agw-14--audit-vercel-deployment-quota-discrepancy) conserva el [informe y borrador de soporte](../docs/incidents/2026-11-01-vercel-deployment-limit.md) del bloqueo Hobby: 32 READY y 110 omisiones automáticas en la ventana auditada. La selección nativa ya está activa en las seis apps; no sustituirla por Ignored Build Step ni deducir consumo del total CANCELED. La causa interna y el desbloqueo requieren evidencia de Vercel. [AGW-15](iterations.md#agw-15--verify-vercel-preview-recovery) separa la verificación Preview pendiente; soporte no se ha contactado.

## Aplicaciones

El monorepo contiene `billing-poc`, `dalis-home-management`, `dalis-tasks-events`, `pocha-score`, `card-wars` y [Damaca Hub](../apps/damaca-hub/plan/master.md). Las bases `mongo-google` y `local-pwa` viven en `turbo/generators/templates/`, fuera de `apps/*`, y crean nuevos workspaces bajo demanda. La lista de apps activas puede cambiar; la obligación documental aplica a todas las apps futuras. El alcance y registro de producto se mantienen en cada plan de app.

## Exclusiones y dudas

No se define aquí un roadmap de producto para ninguna app ni se autoriza promoción a `main`, despliegue o cambios de infraestructura.

La issue transversal [#3](https://github.com/martincalvodaniel/damaca-vercel-apps/issues/3) define la separación de MongoDB pro/int y el refresco por cron. El motor común de [AGW-12](iterations.md#agw-12--shared-database-refresh-and-hub-integration) se conserva, pero AGW-13 suspende su ejecución en todos los entornos y retira su programación e integración de arranque. No activar el refresco sin nueva decisión del usuario.

## Calidad actual

AGW-09 restablece el lint global sin errores de formato. Los avisos y diagnósticos informativos existentes quedan fuera de este corte; evidencia en el [registro](iteration-log.md#agw-09-restore-global-lint-success).

Las seis aplicaciones disponen de favicons propios, recursos de instalación y Apple Touch Icon. Las PWA existentes incluyen iconos maskable; el generador compartido `bun run icons:generate` usa SVG locales y Sharp del catálogo. Entrega transversal [AGW-10](iterations.md#agw-10--application-favicons).

El generador de iconos se ejecuta desde el entorno de desarrollo raíz; las apps compilan de forma independiente con sus instalaciones filtradas de Vercel. CI comprueba los tipos con una instalación aislada por app.

El catálogo y las fichas de administración del Hub muestran los iconos de las aplicaciones desde copias SVG locales sincronizadas por ese mismo generador, sin depender de sus URLs de despliegue.

## Previous identity decision (historical, superseded by AGW-08)

- AGW-05 added a reusable Google/OIDC provider and consumer modules. It required game login and withdrew offline access.
- AGW-08 superseded those game requirements. Pocha Score and Card Wars are public, static and offline; Hub manages OIDC clients for other existing private apps.
- Production and `int` callbacks are explicit per client. Stable Vercel branch aliases are supported; commit-specific preview URLs are out of scope.

> AGW-08 superseded the social-login requirement for Pocha Score and Card Wars. AGW-11 temporarily applied Hub-managed identity to Tasks. AGW-13 restores direct Google authentication and the Tasks email allowlist, preserving Mongo identity and the offline shell.

## Investigación de La Bottega di Pali

[AGW-16](iterations.md#agw-16--investigación-de-la-bottega-y-su-integración-con-billing) documenta la web pública y las alternativas de sustitución de WordPress/WooCommerce e integración con billing en [el dossier de investigación](../docs/research/la-bottega-di-pali/README.md). Las recomendaciones son propuestas para discutir; esta entrega no aprueba arquitectura, crea una aplicación ni inicia implementación.

## Esqueleto público LBDP

La nueva app [lbdp](../apps/lbdp/plan/master.md) desarrolla únicamente el escaparate público autorizado, con registro principal [LBDP-01](../apps/lbdp/plan/iterations.md). Las demás webapps permanecen fuera del alcance; la integración comercial del dossier sigue pendiente.

## Publicación manual de Vercel

[AGW-17](iterations.md#agw-17--manual-vercel-deployments) establece `git.deploymentEnabled: false` en las siete apps. Los deployments se realizan manualmente bajo petición; los pushes que contienen esta configuración no solicitan deployments automáticos de Git. Cada rama debe incorporar la configuración para adoptar esta política.

La skill local [vercel-deploy-alias](../.agents/skills/vercel-deploy-alias/SKILL.md) ofrece selección de aplicación y rama para despliegue manual y movimiento de alias; entrega AGW-18.

La skill [vercel-deployment-report](../.agents/skills/vercel-deployment-report/SKILL.md) cuenta deployments de las últimas 24 horas por estado y aplicación (AGW-19).

La rama seleccionada en vercel-deploy-alias fija el entorno: `main` siempre Production e `int` siempre Preview (AGW-20).

Billing y Home Management incorporan manifiestos web propios con los iconos existentes y apertura en modo independiente. Entrega [AGW-21](iterations.md#agw-21--manifiestos-de-instalación-para-billing-y-home-management).

[AGW-22](iterations.md#agw-22--align-vercel-configuration) unifica las apps y las dos plantillas: despliegue Git desactivado, acceso limitado a España por defecto e instalación condicional con bunx. El Hub conserva las excepciones para endpoints OAuth/OIDC de máquina recogidas en su [entrega 05](../apps/damaca-hub/plan/iterations.md#05--restore-oidc-routing-exceptions).

## Instalación de Dalis

Home Management y Tasks se instalan como `dalis-home` y `dalis-tasks`. Los despliegues de la rama `int` añaden `-int`. La misma configuración se aplica al manifiesto y al título de instalación de Apple. [AGW-23](iterations.md#agw-23--nombres-de-instalación-de-dalis).

## Diseño adaptable

La interfaz de las aplicaciones prioriza el contenido útil y la densidad en móvil. La regla para agentes vive en [AGENTS.md](../AGENTS.md). Ebrias aplica este criterio en su portada inspirada en Los Simpson.
