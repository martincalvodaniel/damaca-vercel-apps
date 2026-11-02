# Registro histórico

## BILL-08 — Márgenes opacos de navegación

- Inicio: 2026-11-01, rama `int`, base `e1ffcb2`, árbol limpio. Capacidad inicial: 11 % en 5 h y 67 % en 7 d; margen estimado suficiente para este ajuste CSS y cierre conservando reservas.
- Aceptación: [BILL-08](iterations.md#bill-08--márgenes-opacos-de-navegación).
- Implementado: posición sticky trasladada a una franja de PageLayout con fondo opaco claro/oscuro, padding superior e inferior y ancho completo del viewport. Barra centrada con el ancho máximo existente; contenido principal a continuación sin duplicar el espacio inferior. Menú y barra comparten la capa de navegación, por debajo de modales.
- Validación: `bun run lint --staged` comprobó cinco archivos sin hallazgos; `bun run type-check --filter=@damaca/billing-poc` correcto; `bun run test --filter=@damaca/billing-poc`: 969 pruebas y 0 fallos; `bun run build --filter=@damaca/billing-poc -- --webpack` correcto. `git diff --cached --check` correcto. La caché remota no estaba disponible; los comandos locales completaron correctamente.
- Revisión estática de anchura, padding, fondos y capas en ambos temas; sin nuevos efectos, listeners ni dependencias. Sin comprobación visual en navegador. Commit, push y SHA remoto se verifican al cerrar.
