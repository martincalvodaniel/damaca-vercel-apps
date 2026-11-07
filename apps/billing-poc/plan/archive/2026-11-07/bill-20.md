# Registro histórico de Billing

## BILL-20 — Una fila de controles en escritorio

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits locales pendientes. Capacidad: 75 % en 5 h y 51 % en 7 d; estimación suficiente para completar y publicar con reservas.
- Aceptación: [BILL-20](../../iterations.md#bill-20--una-fila-de-controles-en-escritorio).

- Implementado: NavigationBar oculta en escritorio la fila de altas separada cuando hay cabecera integrada. Eventos incorpora su + junto al selector mensual; Productos junto al buscador y acciones, con filtros en la misma banda horizontal. Mes reutiliza el + ya existente junto a plantillas y oculta el superior solo en escritorio.
- Móvil: las altas superiores mantienen visibilidad y los botones adicionales de las cabeceras de Eventos/Productos se ocultan. Mes conserva sus dos +. Los controles con estado no se duplican; los botones de alta sin estado comparten exactamente sus callbacks. Sin cambios de datos, dependencias ni efectos.
- Revisión estática de clases responsive, árbol, labels y callbacks; no se realizó verificación visual interactiva en navegador. Se archiva BILL-10 para mantener diez entregas recientes.
- Validación: Biome sobre cinco TSX editados sin hallazgos; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 992 correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto (10,676 s). Caché remota de Turbo no disponible; comprobaciones locales completas. Enlaces locales comprobados. Lint preparado, diff check, commit, push y SHA remoto se verifican al cerrar.
