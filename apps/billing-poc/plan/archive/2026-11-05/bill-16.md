## BILL-16 — Simplificar cabeceras y altas

- Inicio: 2026-11-02, rama `int`, árbol limpio y sin commits locales pendientes. Capacidad inicial: 98 % restante en 5 h y 54 % en 7 d; estimación suficiente para entrega completa conservando reservas.
- Aceptación: [BILL-16](../../iterations.md#bill-16--simplificar-cabeceras-y-altas).
- Alcance: altas de página en navegación; las altas contextuales dentro de modales y plantillas conservan su contexto. Mes conserva su alta local.

- Implementado: slot explícito de acciones PageLayout → NavigationBar; + principal en Clientes, Productos, Eventos, Encargos y Cocciones. Clientes comparte la barra con el buscador a su derecha. Navegación permite envolver enlaces en escritorio y conserva menú móvil. Eliminados títulos/subtítulos redundantes; controles de periodo y filtros conservados; Mes mantiene su + y usa Compacto/Todo. Año traduce desglose, saldo mensual, selector Año/Ir y estado vacío.
- Revisión React/accesibilidad: mismos callbacks y hooks SWR, sin efectos ni dependencias nuevos; + con aria-label; controles y estilos de foco/modo oscuro preservados. No se hizo comprobación visual interactiva en navegador; la revisión responsive es estática.
- Validación: `bun run test --filter=@damaca/billing-poc`: 992 pruebas correctas, 0 fallos, 1802 assertions. `bun run type-check --filter=@damaca/billing-poc`: correcto tras corregir un error temporal de edición de JSX detectado por Biome/tipos. `bun run build --filter=@damaca/billing-poc -- --webpack`: correcto (16,519 s). Caché remota de Turbo no disponible; comprobaciones locales completas. Biome explícito sobre los 14 TSX editados sin hallazgos; lint preparado y diff check se verifican al cerrar.
- Archivo de BILL-06 para conservar diez entregas recientes; enlaces nuevos de planificación comprobados. Capacidad antes de publicar: 96 % en 5 h y 54 % en 7 d. Commit, push y SHA remoto se verifican al cierre.
