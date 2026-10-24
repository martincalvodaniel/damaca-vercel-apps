# Plan agéntico del monorepo

## Objetivo vigente

Aplicar un único protocolo de trabajo para todas las aplicaciones presentes y futuras bajo `apps/*`, con cambios transversales planificados en la raíz. Cada app conserva sus requisitos y límites de producto.

## Decisiones vigentes

- [workflow.md](workflow.md) es el único protocolo normativo. Los tres documentos de planificación tienen responsabilidades separadas descritas allí.
- La política común conserva trabajo en `int`, cierre de iteraciones validadas con commit/push a `origin/int`, verificación del SHA remoto y reservas mínimas de capacidad de 7% en 5h y 2% en 7d. `main` sigue bajo gestión humana.
- Trabajo secuencial por defecto; delegación solo con autorización explícita.
- Toda app bajo `apps/*` adopta `plan/master.md`, `plan/iterations.md` y `plan/iteration-log.md` antes de su primera implementación no trivial.
- La generación futura mediante [Turborepo Generate](https://turborepo.dev/docs/reference/generate) deberá crear esa estructura; no se implementa generador ni control de CI en esta planificación.

## Aplicaciones

El monorepo contiene `billing-poc`, `dalis-home-management`, `dalis-tasks-events`, `my-next-local-template` y `my-next-template`. La lista de apps puede cambiar; la obligación documental aplica a todas las apps futuras.

## Exclusiones y dudas

No se define aquí un roadmap de producto para ninguna app ni se autoriza promoción a `main`, despliegue o cambios de infraestructura.
