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
