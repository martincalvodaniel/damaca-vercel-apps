# Registro archivado de entregas

## HM-13 — Controles compactos y restauración de tareas

- Inicio 2026-11-02 sobre `int`, con HM-12 publicada como base y sin cambios fuera de Home Management. Alcance limitado a la nueva página y sus acciones de persistencia.
- Reordenada la barra superior para colocar el filtro de archivadas/activas y añadir antes del contador. Las tareas archivadas muestran acción de restaurar; el servidor valida la transición y la hace idempotente.
- El histórico alinea corrección y eliminación con la fecha en una única fila. En la lista diaria, el check queda a la izquierda del nombre y alterna completar/deshacer sin confirmación: completar genera la ejecución con hoy y deshacer elimina o devuelve a pendiente el registro correspondiente. Las programaciones pendientes muestran borrar inmediatamente antes del asa de arrastre al extremo derecho; se eliminan los textos redundantes de estado.
- `bunx biome check --write` y comprobación Biome final sobre los archivos editados: correctos. `bun run type-check --filter=@damaca/dalis-home-management`: correcto. `bun run test --filter=@damaca/dalis-home-management`: 182 pruebas correctas, 0 fallos, incluyendo restauración idempotente. Build y publicación se verifican al cierre.
