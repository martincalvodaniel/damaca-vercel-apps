# Registro histórico de Billing

## BILL-22 — Fecha y hora de eventos y favicon original

- Inicio: 2026-11-05, rama `int`, base `3f6fd27`, árbol limpio y sin commits pendientes. Capacidad: 98 % en 5 h y 21 % en 7 d; estimación suficiente para una entrega pequeña completa con reservas.
- Aceptación: [BILL-22](../../iterations.md#bill-22--fecha-y-hora-de-eventos-y-favicon-original).

- Implementado: columnas Fecha y Hora independientes; recurrentes sin día de anclaje, puntuales con día semanal calculado en UTC y sin año visible, fechas parciales sin completar y hora ausente «—». Sin cambios de acciones, orden, estado ni consultas. Revisión React: reutiliza callbacks/memoización existentes; sin efectos ni dependencias nuevas.
- Favicon: ICO original recuperado de `6e9d659^`, verificado visualmente como sello rojo de La Bottega di Pali. SVG incorpora el PNG original de 48 px; regeneradas variantes Apple/instalación con la fuente recuperada. El ICO coincide byte a byte con el original. La resolución disponible del original limita la nitidez de las variantes grandes. Catálogo del hub fuera del alcance de esta entrega.
- Validación: tipos correctos; 998 pruebas correctas, 0 fallos, 1835 assertions; build webpack correcto (18,001 s). Biome explícito sobre los tres archivos de código correcto tras formato; el lint incremental sin preparar no seleccionó archivos, por lo que se valida además con lint preparado. Caché remota de Turbo no disponible; comprobaciones locales completas. No se realizó verificación interactiva de navegador.
- Se archiva BILL-12 para conservar diez entregas recientes. Capacidad antes de cierre: 96 % en 5 h y 21 % en 7 d. Publicación y SHA remoto se verifican al cerrar.
