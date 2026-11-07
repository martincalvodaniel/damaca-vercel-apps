# Registro histórico de Billing

## BILL-19 — Controles de cabecera en navegación de escritorio

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits pendientes. Capacidad: 78 % en 5 h y 51 % en 7 d; estimación suficiente para entrega completa con reservas.
- Aceptación: [BILL-19](../../iterations.md#bill-19--controles-de-cabecera-en-navegación-de-escritorio).

- Implementado: opción compartida de PageLayout para integrar la cabecera en el bloque fijo de escritorio. Activada en Ausencias, Eventos, Mes, Productos y Año. Navegación y controles comparten bordes continuos en escritorio; el bloque completo conserva franja opaca y posición fija.
- Móvil: contenedores de agrupación con `display: contents`; solo la navegación continúa fija y los controles siguen en el flujo de la página, con separación equivalente. CSS determina el layout: sin listeners de tamaño, portales, duplicación de controles ni remontajes al redimensionar. Los otros layouts no activan la opción. Los dos + de Mes se conservan.
- Revisión React/accesibilidad: solo composición y clases responsive; mismos hooks/callbacks, IDs, orden de controles y estado de formulario. Sin nuevas dependencias. Se archiva BILL-09 para mantener diez entregas recientes. Sin comprobación visual interactiva en navegador; revisión estática del árbol y clases.
- Validación: `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 992 pruebas correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto (16,48 s). Biome sobre los siete TSX editados sin hallazgos tras corregir un aviso de ternario; caché remota de Turbo no disponible y comprobaciones locales completas. Enlaces y diff check verificados. Lint preparado, commit, push y SHA remoto se verifican al cierre.
