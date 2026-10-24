> Archivo histórico cerrado el 2026-10-24. No usar como estado vigente, política normativa ni autorización; consultar el plan activo y el workflow raíz.

# Plan agéntico del monorepo

## Objetivo

Mantener un único flujo de entrega para agentes que trabaje en `int`, consulte y preserve las reservas acordadas de capacidad, valide cambios según su alcance, y publique cada iteración completada con comprobación del SHA remoto. Las aplicaciones siguen siendo productos independientes y conservan sus límites técnicos.

## Decisiones vigentes

- El protocolo normativo común está en [workflow.md](../../workflow.md); [AGENTS.md](../../../AGENTS.md) es su punto de entrada.
- Las reservas mínimas son 7% en 5h y 2% en 7d. La herramienta de Codex es la fuente de saldo actual; no derivar capacidad de la duración ni de datos históricos.
- Trabajo secuencial por defecto; delegación requiere autorización explícita para la tarea.
- Los planes locales registran producto y cambios exclusivos de una app. Los tres documentos de este plan raíz registran cambios transversales; una entrega mantiene un único log principal.
- `main` es gestionada por el usuario. La publicación autorizada es a `origin/int`.
- Los templates actuales pueden dejar de ser el mecanismo de creación de apps. La generación futura con [Turborepo Generate](https://turborepo.dev/docs/reference/generate) queda como línea de trabajo separada; esta planificación no implementa generators.

## Aplicaciones cubiertas

`billing-poc`, `dalis-home-management`, `dalis-tasks-events`, `my-next-local-template` y `my-next-template`. Cada una mantiene su stack, seguridad, datos, QA y política de despliegue específica.
