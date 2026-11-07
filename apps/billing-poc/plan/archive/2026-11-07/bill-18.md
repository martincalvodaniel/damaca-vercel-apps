# Registro histórico de Billing

## BILL-18 — Navegación de escritorio

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 81 % en 5 h y 52 % en 7 d; estimación suficiente para completar y publicar con reservas.
- Aceptación: [BILL-18](../../iterations.md#bill-18--navegación-de-escritorio).

- Implementado: identificación Billing/título con `xl:hidden`; menú de escritorio antes del slot de acciones en el DOM y controles en una fila inferior de ancho completo. En móvil, el menú de escritorio sigue oculto y se mantiene título → acciones → botón de menú. Se conservan eventos, sesión, estilos, navegación fija y breakpoints.
- Revisión React/accesibilidad: cambio limitado a estructura y clases responsive, sin hooks/efectos nuevos, elementos duplicados ni cambios de callbacks. Orden de tabulación de escritorio alineado con menú → controles. No se realizó comprobación visual interactiva; revisión estática.
- Se archiva BILL-08 para mantener diez entregas recientes.
- Validación: Biome del componente sin hallazgos; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 992 correctas, 0 fallos y 1802 assertions; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto (10,044 s). Caché remota de Turbo no disponible; comprobaciones locales completas. Enlaces locales de planificación y diff check correctos. Lint preparado, commit, push y SHA remoto se verifican al cierre.
