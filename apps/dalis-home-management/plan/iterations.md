# Iteraciones

El contrato común de planificación para esta app se estableció en la entrega transversal [AGW-01](../../../plan/iteration-log.md#agw-01-centralizar-el-flujo-y-el-contrato-documental). El [workflow raíz](../../../plan/workflow.md) es el único protocolo.

## HM-01 — Receta y observaciones opcionales

- Estado: `validated`.
- Objetivo: guardar y consultar texto libre opcional por plato.
- Rutas: `src/schemas/dish*`, `src/lib/db/dishes*`, `src/features/meal-planning/actions.ts`, `src/features/meal-planning/components/` y `plan/`.
- Dependencias: flujo actual de platos, sin nuevas dependencias, consultas ni índices.
- Aceptación: crear y editar con o sin notas; recuperar y borrar notas; conservar saltos de línea; consulta en recetario y menú; compatibilidad con documentos existentes; validar límite de 10.000 caracteres en cliente y servidor.
- Validación prevista: Biome incremental, tipos, tests de la app, build y revisión del diff.
- Evidencia: [HM-01](iteration-log.md#hm-01--receta-y-observaciones-opcionales).

## HM-02 — Listas compactas y limpieza de búsquedas

- Estado: `validated`.
- Objetivo: mostrar más información en las cuatro páginas y mantener una cruz roja para limpiar cualquier búsqueda no vacía, incluso sin foco.
- Rutas: `src/components/ui/`, componentes de listas y menú en `src/features/`, y `plan/`.
- Dependencias: componentes existentes; sin nuevas dependencias ni cambios de datos.
- Aceptación: reducir padding, márgenes y separaciones verticales en inventario, compra, recetario y menú; conservar acciones y legibilidad; cruz roja visible con texto, oculta sin texto y accesible con teclado en búsquedas y selectores con búsqueda.
- Validación prevista: Biome incremental, tipos, tests de la app, build y revisión del diff.
- Evidencia: [HM-02](iteration-log.md#hm-02--listas-compactas-y-limpieza-de-búsquedas).
