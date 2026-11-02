# Archivo de entregas

## HM-01 — Receta y observaciones opcionales

- Inicio: 2026-10-31. Capacidad consultada: 84% restante de 5h y 97% de 7d. Estimación conservadora: menos de 10 puntos de 5h y 3 de 7d para implementación, validación y publicación; respeta las reservas.
- Alcance y aceptación: [HM-01](../../iterations.md#hm-01--receta-y-observaciones-opcionales).
- Implementado `notes` opcional en esquema, Server Actions y lectura/escritura MongoDB. Vaciar el campo reemplaza las notas previas por texto vacío. Sin nuevas consultas o índices y sin migración.
- Formulario con etiqueta y textarea; consulta plegable reutilizada en recetario y menú semanal. Texto escapado por React, con saltos de línea y ajuste de palabras largas.
- Corregidos todos los avisos de Biome en archivos editados: callbacks estables y convención `it` en tests. Revisión adicional con `vercel-react-best-practices` y `vercel:react-best-practices`: sin nuevas dependencias, peticiones, efectos o estado para las notas; marcado nativo accesible.
- `bun run lint --staged`: 11 archivos, sin hallazgos. La comprobación inicial con `--changed` no cubría cambios sin preparar; se sustituyó por esta validación sobre todos los archivos preparados.
- `bun run type-check --filter=@damaca/dalis-home-management`: correcto.
- `bun run test --filter=@damaca/dalis-home-management`: 101 tests correctos, 0 fallos; incluye notas ausentes/vacías, saltos de línea, longitud máxima y entradas inválidas.
- El primer build Turbopack pasó antes de corregir callbacks. El build final con Turbopack falló al abrir un puerto de PostCSS (`Operation not permitted`), también tras solicitar ejecución fuera del sandbox. `bun run build --filter=@damaca/dalis-home-management -- --webpack`: correcto sobre la versión final, sin cambiar configuración del proyecto.
- `git diff --check` y enlaces locales de los planes: correctos. Sin prueba interactiva autenticada ni escrituras en la base de datos real.
- Capacidad refrescada antes del cierre: 81% de 5h y 97% de 7d, por encima de reservas.
- Rama `int`, sin cambios previos ajenos ni commits locales pendientes al inicio. Referencia remota comprobada antes de publicar: `ecda84c748e56552a64a4287a06dadb0899a3b47`. Preparada para commit y publicación; la coincidencia del SHA remoto se comprueba al cierre.
