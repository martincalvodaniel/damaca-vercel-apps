## BILL-17 — Alta mensual, orden de cocciones y traducción de facturas

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits pendientes de publicación. Capacidad: 87 % restante en 5 h y 53 % en 7 d; estimación suficiente para implementar, validar y publicar manteniendo reservas.
- Aceptación: [BILL-17](../../iterations.md#bill-17--alta-mensual-orden-de-cocciones-y-traducción-de-facturas).

- Implementado: Mes mantiene el + junto a plantillas y añade otro en navegación con el mismo callback. Cocciones sitúa Pagadas antes de las vigentes, preservando cierre inicial, contador, tarjetas y el orden de Encargos.
- Facturas: traducidos estado vacío, nombres de las cuatro series, numeración, listado, fecha del pago y todos los textos de revisión/reducción. Errores de carga en español; las cuatro causas de rechazo de reducción conservan su significado mediante mensajes españoles, sin mostrar mensajes internos ingleses. Fallbacks de mutación también en español; valores internos y prefijos sin cambios.
- Revisión React: slot compartido de navegación, callbacks y SWR existentes, sin dependencias ni efectos nuevos. La misma sección de pagadas se renderiza una sola vez según el contexto. Iconos etiquetados y estilos claros/oscuros conservados. Sin verificación visual interactiva; revisión estática de orden y callbacks.
- Se archiva BILL-07 para conservar diez entregas recientes. Validación y publicación se registran al cerrar.
- Validación final: `bun run type-check --filter=@damaca/billing-poc`, correcto; `bun run test --filter=@damaca/billing-poc`, 992 correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack`, correcto (9,566 s). Biome explícito sobre los ocho TS/TSX editados sin hallazgos tras formato. Caché remota de Turbo no disponible; comprobaciones locales completas. Lint preparado, diff check, commit, push y SHA remoto se verifican al cierre.
