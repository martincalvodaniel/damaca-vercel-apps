# Registro histórico

## BILL-11 — Traducción de la interfaz al español

- Inicio: 2026-11-01, rama `int`, base `36ccd49`; árbol limpio. Capacidad inicial: 100 % en 5 h y 66 % en 7 d.
- Aceptación: [BILL-11](../../iterations.md#bill-11--traducción-de-la-interfaz-al-español).
- Decisión del usuario: mostrar `Commissions` como `Encargos`.
- Implementado: navegación y las secciones de autenticación, clientes, encargos, eventos, facturas, pagos mensuales/anuales, productos, ausencias y WordPress traducidas. Incluidos formularios, tablas, botones, mensajes y errores, estados vacíos, placeholders, etiquetas accesibles y metadatos. Documento con `lang="es"`; fechas y meses con `es-ES`; marcas y valores internos de API conservan su identidad.
- Validación: Biome explícito en los 122 archivos TSX modificados y `bun run lint --staged` (124 archivos): correcto. `bun run type-check --filter=@damaca/billing-poc`: correcto. `bun run build --filter=@damaca/billing-poc`: Turbopack no pudo enlazar un puerto interno (`Operation not permitted`); `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto, con todas las rutas compiladas. `git diff --check`: correcto. No se ejecutaron pruebas.
- La opción semántica de “Commissions” fue confirmada como “Encargos”. Los valores de factura/recibo de la API se conservaron, traduciendo solo las etiquetas visibles.
- Publicación: commit `ccab1a73340fe1bdb5537ddf4c9bfdcd20a58960` en `int`; `git ls-remote origin refs/heads/int` confirmó el mismo SHA.
- Capacidad al cierre: 97 % restante en 5 h y 66 % en 7 d.
